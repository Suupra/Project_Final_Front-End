<template>
  <div class="w-2/4 mx-auto pt-4">
    <!-- Caixa de postagem -->
    <div class="bg-black text-white p-4 rounded-lg shadow-md mb-4 border border-gray-700">
      <div class="flex items-start space-x-3">
        <!-- Avatar do Usuário -->
        <img :src="currentUserPhotoURL" alt="Avatar" class="w-10 h-10 rounded-full border border-white">
        <!-- Input de Postagem -->
        <div class="flex-1">
          <textarea v-model="tweetContent" placeholder="O que está acontecendo?"
            class="bg-gray-800 text-white w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"></textarea>
          <div class="flex justify-between mt-2 items-center">
            <div class="flex space-x-4">
              <input type="file" @change="onFileChange" class="hidden" ref="fileInput" />
              <font-awesome-icon icon="image" class="w-5 h-5 cursor-pointer" @click="triggerFileInput" />
            </div>
            <button @click="postTweet" class="bg-blue-500 text-white px-4 py-1.5 rounded-full">Postar</button>
          </div>
          <div v-if="imagePreview" class="mt-2">
            <img :src="imagePreview" alt="Image Preview" class="max-w-full h-auto rounded-lg border border-gray-600" />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div v-for="tweet in tweets" :key="tweet.id">
        <template
          v-if="tweet && (typeof tweet.isFollowing !== 'undefined' && tweet.isFollowing || tweet.userId === currentUserId)">
          <div class="bg-black text-white p-4 rounded-lg shadow-md border border-gray-700">
            <div class="flex space-x-3">
              <img :src="tweet.userAvatarUrl || 'https://via.placeholder.com/150'" alt="Avatar"
                class="w-10 h-10 rounded-full border border-white">
              <div>
                <router-link :to="{ name: 'user-profile', params: { userId: tweet.userId } }"
                  class="font-bold text-sm truncate">
                  {{ tweet.displayName }}
                </router-link>
                <p>{{ tweet.content }}</p>
                <img v-if="tweet.imageUrl" :src="tweet.imageUrl" alt="Tweet Image"
                  class="mt-2 rounded-lg max-w-full h-auto border border-gray-600" />
                <div class="flex items-center mt-2">
                  <button @click="toggleLike(tweet)" class="focus:outline-none">
                    <font-awesome-icon :icon="['fas', 'heart']"
                      :class="{ 'text-red-500': tweet.isLiked, 'text-blue-500': !tweet.isLiked }"
                      class="w-4 h-4 mr-1" />
                  </button>
                  <span class="ml-2">{{ tweet.likes }}</span>
                  <button @click="toggleCommentInput(tweet)" class="focus:outline-none ml-2">
                    <font-awesome-icon icon="comment" class="w-4 h-4 text-blue-500" />
                  </button>
                </div>
                <div v-if="tweet.showCommentInput" class="mt-2">
                  <input v-model="newComment" placeholder="Adicionar um comentário..."
                    class="bg-gray-800 text-white w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">
                  <button @click="addComment(tweet.id)"
                    class="bg-blue-500 text-white px-4 py-1.5 rounded-full mt-2">Comentar</button>
                </div>
                <div class="mt-2" v-for="comment in tweet.comments" :key="comment.createdAt.seconds">
                  <div class="flex space-x-3">
                    <img :src="comment.avatarUrl || 'https://via.placeholder.com/150'" alt="Avatar"
                      class="w-8 h-8 rounded-full border border-white">
                    <div>
                      <p class="text-sm text-gray-400">{{ comment.displayName }} <span class="text-sm text-gray-500">{{
                        formatDate(comment.createdAt) }}</span></p>
                      <p class="text-white">{{ comment.content }}</p>
                      <div class="flex items-center mt-2">
                        <button @click="toggleCommentLike(tweet.id, comment)" class="focus:outline-none">
                          <font-awesome-icon :icon="['fas', 'heart']"
                            :class="{ 'text-red-500': (comment.likedBy || []).includes(currentUserId), 'text-blue-500': !(comment.likedBy || []).includes(currentUserId) }"
                            class="w-4 h-4 mr-1" />
                        </button>
                        <span class="ml-2">{{ comment.likes || 0 }}</span>
                      </div>
                    </div>
                    <div v-if="comment.email === currentUser.email" class="ml-auto">
                      <font-awesome-icon icon="trash" class="w-4 h-4 text-gray-400 cursor-pointer"
                        @click="deleteComment(tweet.id, comment)" />
                    </div>
                  </div>
                </div>
                <div v-if="tweet.userId === currentUserId" class="mt-2 relative">
                  <font-awesome-icon icon="trash" class="text-gray-400 cursor-pointer" @click="deleteTweet(tweet.id)" />
                </div>
                <div v-if="tweet.userId !== currentUserId" class="mt-2 relative">
                  <font-awesome-icon icon="ellipsis-h" class="text-gray-400 cursor-pointer"
                    @click="toggleMenu(tweet)" />
                  <div v-if="tweet.showMenu" class="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg z-10">
                    <div class="block px-4 py-2 text-gray-400 cursor-pointer" @click="toggleFollow(tweet)">
                      {{ tweet.isFollowing ? 'Deixar de Seguir' : 'Seguir' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { auth, storage } from '../firebase';
import { addDoc, collection, getFirestore, serverTimestamp, query, orderBy, getDocs, updateDoc, doc, limit, setDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { faImage, faComment, faHeart, faEllipsisH, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const db = getFirestore();
const tweetsCollection = collection(db, 'tweets');
const usersCollection = collection(db, 'users');

const tweetContent = ref('');
const tweets = ref([]);
const file = ref(null);
const fileInput = ref(null);
const reload = ref(0);
const showMenu = ref(false);
const imagePreview = ref(null);
const newComment = ref('');

const currentUser = auth.currentUser;
const currentUserId = currentUser ? currentUser.uid : null;
const currentUserPhotoURL = currentUser ? currentUser.photoURL || 'https://via.placeholder.com/150' : 'https://via.placeholder.com/150';

const onFileChange = (event) => {
  file.value = event.target.files[0];
  if (file.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file.value);
  } else {
    imagePreview.value = null;
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const postTweet = async () => {
  if (tweetContent.value.trim() === '' && !file.value) {
    alert('Tweet cannot be empty.');
    return;
  }

  try {
    let imageUrl = '';
    if (file.value) {
      const fileRef = storageRef(storage, `tweets/${currentUser.uid}/${Date.now()}_${file.value.name}`);
      await uploadBytes(fileRef, file.value);
      imageUrl = await getDownloadURL(fileRef);
    }

    const userEmail = currentUser.email;
    const userAvatarUrl = currentUser.photoURL || 'https://via.placeholder.com/150';

    await addDoc(tweetsCollection, {
      userId: currentUser.uid,
      email: userEmail,
      content: tweetContent.value,
      createdAt: serverTimestamp(),
      likes: 0,
      imageUrl: imageUrl,
      userAvatarUrl: userAvatarUrl,
      comments: [],
      likedBy: [] // Lista de IDs de usuários que deram like
    });

    tweetContent.value = '';
    file.value = null;
    reload.value++;
    imagePreview.value = null;
  } catch (error) {
    console.error('Error posting tweet: ', error);
  }
};

const toggleCommentInput = (tweet) => {
  tweet.showCommentInput = !tweet.showCommentInput;
};

const addComment = async (tweetId) => {
  if (newComment.value.trim() === '') {
    alert('Comentário não pode estar vazio.');
    return;
  }

  try {
    const tweetRef = doc(tweetsCollection, tweetId);
    const tweetDoc = await getDoc(tweetRef);
    const tweetData = tweetDoc.data();

    const comment = {
      email: currentUser.email,
      avatarUrl: currentUser.photoURL || 'https://via.placeholder.com/150',
      content: newComment.value,
      createdAt: Timestamp.now(), // Usar Timestamp diretamente
      likes: 0,
      likedBy: [], // Lista de IDs de usuários que deram like no comentário
      userId: currentUser.uid
    };

    const updatedComments = [...tweetData.comments, comment];

    await updateDoc(tweetRef, {
      comments: updatedComments
    });

    newComment.value = '';
    reload.value++;
  } catch (error) {
    console.error('Error adding comment: ', error);
  }
};

const deleteComment = async (tweetId, comment) => {
  try {
    const tweetRef = doc(tweetsCollection, tweetId);
    const tweetDoc = await getDoc(tweetRef);
    const tweetData = tweetDoc.data();

    const updatedComments = tweetData.comments.filter(c => c.createdAt.seconds !== comment.createdAt.seconds);

    await updateDoc(tweetRef, {
      comments: updatedComments
    });

    reload.value++;
  } catch (error) {
    console.error('Error deleting comment: ', error);
  }
};

const toggleCommentLike = async (tweetId, comment) => {
  try {
    const tweetRef = doc(tweetsCollection, tweetId);
    const tweetDoc = await getDoc(tweetRef);
    const tweetData = tweetDoc.data();

    const updatedComments = tweetData.comments.map(c => {
      if (c.createdAt.seconds === comment.createdAt.seconds) {
        const likedBy = c.likedBy || [];
        if (likedBy.includes(currentUserId)) {
          return {
            ...c,
            likes: (c.likes || 0) - 1,
            likedBy: likedBy.filter(userId => userId !== currentUserId)
          };
        } else {
          return {
            ...c,
            likes: (c.likes || 0) + 1,
            likedBy: [...likedBy, currentUserId]
          };
        }
      }
      return c;
    });

    await updateDoc(tweetRef, {
      comments: updatedComments
    });

    reload.value++;
  } catch (error) {
    console.error('Error toggling like on comment: ', error);
  }
};

const toggleLike = async (tweet) => {
  try {
    const tweetRef = doc(tweetsCollection, tweet.id);
    const tweetDoc = await getDoc(tweetRef);
    const likedBy = tweetDoc.data().likedBy || [];

    if (likedBy.includes(currentUserId)) {
      await updateDoc(tweetRef, {
        likes: tweet.likes - 1,
        likedBy: likedBy.filter(userId => userId !== currentUserId)
      });
      tweet.likes -= 1;
      tweet.isLiked = false;
    } else {
      await updateDoc(tweetRef, {
        likes: tweet.likes + 1,
        likedBy: [...likedBy, currentUserId]
      });
      tweet.likes += 1;
      tweet.isLiked = true;
    }
  } catch (error) {
    console.error('Error toggling like: ', error);
  }
};

const toggleMenu = (tweet) => {
  tweet.showMenu = !tweet.showMenu;
};

const deleteTweet = async (tweetId) => {
  try {
    await deleteDoc(doc(tweetsCollection, tweetId));
    reload.value++;
  } catch (error) {
    console.error('Error deleting tweet: ', error);
  }
};

const toggleFollow = async (tweet) => {
  try {
    const userId = tweet.userId;
    if (userId === currentUserId) {
      alert("Você não pode seguir a si mesmo.");
      return;
    }

    if (tweet.isFollowing) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
    tweet.isFollowing = !tweet.isFollowing;
    tweet.showMenu = false; // Fechar o menu após ação
  } catch (error) {
    console.error('Error toggling follow: ', error);
  }
};

const followUser = async (userId) => {
  try {
    if (currentUser) {
      const followerDocRef = doc(collection(db, 'followers', userId, 'followers'), currentUser.uid);
      const followingDocRef = doc(collection(db, 'following', currentUser.uid, 'following'), userId);

      await setDoc(followerDocRef, {
        userId: currentUser.uid,
        followedAt: serverTimestamp()
      });

      await setDoc(followingDocRef, {
        userId: userId,
        followedAt: serverTimestamp()
      });

      reload.value++;
    }
  } catch (error) {
    console.error('Error following user: ', error);
  }
};

const unfollowUser = async (userId) => {
  try {
    if (currentUser) {
      const followerDocRef = doc(collection(db, 'followers', userId, 'followers'), currentUser.uid);
      const followingDocRef = doc(collection(db, 'following', currentUser.uid, 'following'), userId);

      await deleteDoc(followerDocRef);
      await deleteDoc(followingDocRef);

      reload.value++;
    }
  } catch (error) {
    console.error('Error unfollowing user: ', error);
  }
};

const loadInitialTweets = async () => {
  try {
    const q = query(tweetsCollection, orderBy('createdAt', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const currentUser = auth.currentUser;
      const followingSnapshot = await getDocs(collection(db, 'following', currentUser.uid, 'following'));
      const usersSnapshot = await getDocs(usersCollection);

      const users = usersSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().displayName;
        return acc;
      }, {});

      const following = followingSnapshot.docs.map(doc => doc.id);

      tweets.value = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const likedBy = data.likedBy || [];
        const comments = data.comments.map(comment => ({
          ...comment,
          likedBy: comment.likedBy || [],
          displayName: users[comment.userId] || 'Unknown'
        }));
        return {
          id: doc.id,
          ...data,
          displayName: users[data.userId] || 'Unknown',
          isLiked: likedBy.includes(currentUser.uid),
          isFollowing: following.includes(data.userId),
          comments: comments,
          showCommentInput: false,
          showMenu: false // Inicializar o estado do menu suspenso
        };
      }));
    }
  } catch (error) {
    console.error('Error loading initial tweets: ', error);
  }
};


const formatDate = (timestamp) => {
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  }
  return '';
};

const logout = async () => {
  try {
    await auth.signOut();
    window.location.reload(); // Recarregar a página após logout
  } catch (error) {
    console.error('Error during logout: ', error);
  }
};

onMounted(async () => {
  await loadInitialTweets();
});

watchEffect(async () => {
  if (reload.value > 0) {
    await loadInitialTweets();
  }
});
</script>

<style scoped>
.bg-black {
  background-color: #000000;
}

.text-white {
  color: #ffffff;
}

.border {
  border: 1px solid #333333;
}

.rounded-lg {
  border-radius: 8px;
}

.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.space-y-4>*+* {
  margin-top: 1rem;
}

.resize-none {
  resize: none;
}
</style>
