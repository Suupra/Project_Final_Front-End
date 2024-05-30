<template>
  <SideBar />
  <div class="w-2/4 mx-auto pt-4 space-y-4">
    <!-- Botão para voltar -->
    <div class="flex justify-start">
      <button @click="goBack" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Voltar</button>
    </div>

    <!-- Perfil do Usuário -->
    <div class="bg-gray-900 text-white p-6 rounded-lg shadow-md border border-gray-700 flex items-center space-x-4">
      <img :src="userPhotoURL || 'https://via.placeholder.com/150'" alt="User Avatar" class="w-20 h-20 rounded-full border-2 border-blue-500">
      <div class="flex-1">
        <h2 class="text-xl font-bold">{{ user.displayName }}</h2>
        <p class="text-sm text-gray-400">{{ user.email }}</p>
        <button @click="toggleFollow" class="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">
          {{ isFollowing ? 'Deixar de Seguir' : 'Seguir' }}
        </button>
      </div>
    </div>

    <!-- Tweets do Usuário -->
    <div v-for="tweet in userTweets" :key="tweet.id" class="bg-gray-800 text-white p-6 rounded-lg shadow-md border border-gray-700">
      <div class="flex space-x-4 items-start">
        <img :src="tweet.userAvatarUrl || 'https://via.placeholder.com/150'" alt="Avatar" class="w-12 h-12 rounded-full border border-gray-500">
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold">{{ tweet.displayName }}</p>
              <p class="mt-2">{{ tweet.content }}</p>
            </div>
            <div class="flex items-center">
              <p class="text-sm text-gray-400">{{ new Date(tweet.createdAt.seconds * 1000).toLocaleString() }}</p>
              <div v-if="tweet.userId === currentUserId" class="ml-2 relative">
                <font-awesome-icon icon="trash" class="text-gray-400 cursor-pointer" @click="deleteTweet(tweet.id)" />
              </div>
            </div>
          </div>
          <img v-if="tweet.imageUrl" :src="tweet.imageUrl" alt="Tweet Image" class="mt-4 rounded-lg max-w-full h-auto border border-gray-600" />
          <div class="flex items-center mt-2">
            <button @click="toggleLike(tweet)" class="focus:outline-none">
              <font-awesome-icon :icon="['fas', 'heart']" :class="{ 'text-red-500': tweet.isLiked, 'text-blue-500': !tweet.isLiked }" class="w-4 h-4 mr-1" />
            </button>
            <span class="ml-2">{{ tweet.likes }}</span>
          </div>
          <!-- Comentários -->
          <div class="mt-4">
            <p class="font-bold">Comentários</p>
            <div v-for="comment in tweet.comments" :key="comment.createdAt" class="flex items-start space-x-2 mt-2">
              <img :src="comment.avatarUrl || 'https://via.placeholder.com/150'" alt="User Avatar" class="w-8 h-8 rounded-full border border-gray-500">
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-bold">{{ comment.displayName }}</p>
                    <p>{{ comment.content }}</p>
                  </div>
                  <div v-if="comment.userId === currentUserId" class="ml-2 relative">
                    <font-awesome-icon icon="trash" class="cursor-pointer" @click="deleteComment(tweet.id, comment)" />
                  </div>
                </div>
                <div class="flex items-center mt-1">
                  <button @click="toggleCommentLike(tweet, comment)" class="focus:outline-none">
                    <font-awesome-icon :icon="['fas', 'heart']" :class="{ 'text-red-500': comment.isLiked, 'text-blue-500': !comment.isLiked }" class="w-4 h-4 mr-1" />
                  </button>
                  <span class="ml-2">{{ comment.likes || 0 }}</span>
                </div>
              </div>
            </div>
            <div v-if="tweet.showCommentInput" class="mt-2 flex items-center space-x-2">
              <input v-model="newComment" placeholder="Adicionar comentário..." class="bg-gray-700 text-white w-full p-2 rounded-lg focus:outline-none">
              <button @click="addComment(tweet)" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Comentar</button>
            </div>
            <button @click="toggleCommentInput(tweet)" class="text-blue-500 mt-2">{{ tweet.showCommentInput ? 'Cancelar' : 'Adicionar comentário' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Trends />
</template>


  
  
  




<script setup>
import SideBar from '../components/SideBar.vue'
import Trends from '../components/Trends.vue'
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';

const db = getFirestore();
const user = ref({});
const userTweets = ref([]);
const userPhotoURL = ref('');
const isFollowing = ref(false);

const newComment = ref('');
const reload = ref(0);

const route = useRoute();
const router = useRouter();
const userId = route.params.userId;
const currentUser = auth.currentUser;
const currentUserId = currentUser ? currentUser.uid : null;

const loadUser = async () => {
  try {
    const userDoc = await getDoc(doc(collection(db, 'users'), userId));
    if (userDoc.exists()) {
      user.value = userDoc.data();
      userPhotoURL.value = user.value.photoURL || 'https://via.placeholder.com/150';
      await checkIfFollowing();
    }
  } catch (error) {
    console.error('Error loading user:', error);
  }
};

const loadUserTweets = async () => {
  try {
    const q = query(collection(db, 'tweets'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      userTweets.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        data.showCommentInput = false; // Inicializa showCommentInput para controle de visibilidade
        data.isLiked = data.likedBy && data.likedBy.includes(currentUserId); // Verifica se o usuário atual deu like
        data.comments = data.comments || [];
        data.comments.forEach(comment => {
          comment.isLiked = comment.likedBy && comment.likedBy.includes(currentUserId); // Verifica se o usuário atual deu like no comentário
          // Adiciona displayName para cada comentário se não existir
          if (!comment.displayName) {
            comment.displayName = comment.email.split('@')[0]; // Fallback para email
          }
        });
        return {
          id: doc.id,
          ...data
        };
      });
    }
  } catch (error) {
    console.error('Error loading user tweets:', error);
  }
};

const toggleLike = async (tweet) => {
  try {
    const tweetRef = doc(collection(db, 'tweets'), tweet.id);
    if (tweet.isLiked) {
      await updateDoc(tweetRef, {
        likes: tweet.likes - 1,
        likedBy: arrayRemove(currentUserId)
      });
      tweet.likes -= 1;
    } else {
      await updateDoc(tweetRef, {
        likes: tweet.likes + 1,
        likedBy: arrayUnion(currentUserId)
      });
      tweet.likes += 1;
    }
    tweet.isLiked = !tweet.isLiked;
  } catch (error) {
    console.error('Error toggling like:', error);
  }
};

const toggleCommentLike = async (tweet, comment) => {
  try {
    const tweetRef = doc(collection(db, 'tweets'), tweet.id);
    const commentIndex = tweet.comments.findIndex(c => c.createdAt === comment.createdAt && c.userId === comment.userId);
    if (comment.isLiked) {
      tweet.comments[commentIndex].likes -= 1;
      tweet.comments[commentIndex].likedBy = tweet.comments[commentIndex].likedBy.filter(uid => uid !== currentUserId);
    } else {
      tweet.comments[commentIndex].likes = (tweet.comments[commentIndex].likes || 0) + 1;
      if (!tweet.comments[commentIndex].likedBy) {
        tweet.comments[commentIndex].likedBy = [];
      }
      tweet.comments[commentIndex].likedBy.push(currentUserId);
    }
    comment.isLiked = !comment.isLiked;
    await updateDoc(tweetRef, {
      comments: tweet.comments
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
  }
};

const toggleCommentInput = (tweet) => {
  tweet.showCommentInput = !tweet.showCommentInput;
};

const addComment = async (tweet) => {
  if (newComment.value.trim() === '') {
    alert('Comentário não pode estar vazio.');
    return;
  }

  try {
    const tweetRef = doc(collection(db, 'tweets'), tweet.id);
    const comment = {
      displayName: currentUser.displayName,
      email: currentUser.email,
      avatarUrl: currentUser.photoURL || 'https://via.placeholder.com/150',
      content: newComment.value,
      createdAt: Timestamp.now(), 
      likes: 0,
      likedBy: [], 
      userId: currentUser.uid
    };

    tweet.comments.push(comment);
    await updateDoc(tweetRef, {
      comments: tweet.comments
    });

    newComment.value = '';
  } catch (error) {
    console.error('Error adding comment: ', error);
  }
};

const deleteComment = async (tweetId, comment) => {
  try {
    const tweetRef = doc(collection(db, 'tweets'), tweetId);
    const tweetDoc = await getDoc(tweetRef);

    if (!tweetDoc.exists()) {
      console.error('Tweet não encontrado');
      return;
    }

    const tweetData = tweetDoc.data();
    const updatedComments = tweetData.comments.filter(c => c.createdAt !== comment.createdAt && c.userId !== comment.userId);

    await updateDoc(tweetRef, {
      comments: updatedComments
    });

    // Atualiza localmente os comentários
    const tweet = userTweets.value.find(t => t.id === tweetId);
    tweet.comments = updatedComments;
  } catch (error) {
    console.error('Error deleting comment: ', error);
  }
};

const deleteTweet = async (tweetId) => {
  try {
    await deleteDoc(doc(collection(db, 'tweets'), tweetId));
    userTweets.value = userTweets.value.filter(tweet => tweet.id !== tweetId);
  } catch (error) {
    console.error('Error deleting tweet: ', error);
  }
};

const toggleFollow = async () => {
  if (!currentUser) {
    return;
  }

  const followerDocRef = doc(collection(db, 'followers', userId, 'followers'), currentUser.uid);
  const followingDocRef = doc(collection(db, 'following', currentUser.uid, 'following'), userId);

  if (isFollowing.value) {
    await deleteDoc(followerDocRef);
    await deleteDoc(followingDocRef);
  } else {
    await setDoc(followerDocRef, {
      userId: currentUser.uid,
      followedAt: serverTimestamp()
    });
    await setDoc(followingDocRef, {
      userId: userId,
      followedAt: serverTimestamp()
    });
  }
  isFollowing.value = !isFollowing.value;
};

const checkIfFollowing = async () => {
  if (!currentUser) {
    return;
  }

  const followingDocRef = doc(collection(db, 'following', currentUser.uid, 'following'), userId);
  const followingDoc = await getDoc(followingDocRef);
  isFollowing.value = followingDoc.exists();
};

const goBack = () => {
  router.back();
};

onMounted(async () => {
  await loadUser();
  await loadUserTweets();
});
</script>






<style scoped>
.bg-gray-900 {
    background-color: #1f2937;
}

.bg-gray-800 {
    background-color: #2d3748;
}

.text-white {
    color: #ffffff;
}

.border-gray-700 {
    border-color: #4a5568;
}

.border-gray-600 {
    border-color: #718096;
}

.border-blue-500 {
    border-color: #3b82f6;
}

.text-gray-400 {
    color: #a0aec0;
}

.rounded-lg {
    border-radius: 0.5rem;
}

.shadow-md {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mx-auto {
    margin-left: auto;
    margin-right: auto;
}

.pt-4 {
    padding-top: 1rem;
}

.space-y-4>*+* {
    margin-top: 1rem;
}

.space-x-4>*+* {
    margin-left: 1rem;
}

.font-bold {
    font-weight: 700;
}

.bg-blue-500 {
    background-color: #3b82f6;
}

.p-6 {
    padding: 1.5rem;
}

.px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
}

.py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
}
</style>
