<template>
  <div class="w-1/4 bg-black text-white p-4 h-screen fixed top-0 right-0 space-y-4 overflow-y-auto pr-10">
    <div class="relative mb-4 mt-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar"
        class="w-full p-2 pl-10 bg-gray-800 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <svg class="w-5 h-5 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-4.35-4.35m-3.65 1.85a7 7 0 100-14 7 7 0 000 14z"></path>
      </svg>
      <div v-if="searchQuery.trim() !== ''" class="absolute z-10 bg-gray-800 mt-1 rounded-lg shadow-lg w-full">
        <div v-for="user in filteredUsers" :key="user.uid" class="flex items-center space-x-2 p-2 border-b border-gray-700">
          <img :src="user.photoURL || 'https://via.placeholder.com/150'" alt="User Avatar"
            class="w-10 h-10 rounded-full border border-white">
          <div class="flex-1 min-w-0">
            <router-link :to="{ name: 'user-profile', params: { userId: user.uid } }" class="font-bold text-sm truncate">
              {{ user.displayName }}
              
            </router-link>
            <p class="text-gray-400 text-sm truncate">{{ user.email }}</p>
          </div>
        </div>
        <div v-if="filteredUsers.length === 0" class="p-2 text-gray-400">No results found</div>
      </div>
    </div>

    <div class="bg-gray-800 p-4 rounded-lg mb-4">
      <h2 class="text-lg font-bold mb-2">Quem seguir</h2>
      <div class="space-y-4">
        <div v-for="user in usersToFollow" :key="user.uid" class="flex items-center space-x-2">
          <img :src="user.photoURL || 'https://via.placeholder.com/150'" alt="User Avatar"
            class="w-10 h-10 rounded-full border border-white">
          <div class="flex-1 min-w-0">
            <router-link :to="{ name: 'user-profile', params: { userId: user.uid } }" class="font-bold text-sm truncate">
              {{ user.displayName }}
              
            </router-link>            <button @click="followUser(user.uid)" class="bg-blue-500 text-white px-4 py-1.5 rounded-full mt-1"
              :disabled="isFollowing(user.uid)">
              {{ isFollowing(user.uid) ? 'Seguindo' : 'Seguir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-gray-800 p-4 rounded-lg">
      <h2 class="text-lg font-bold mb-2">Tendências de Portugal</h2>
      <div class="space-y-4" v-if="mostLikedTweets.length">
        <div v-for="tweet in mostLikedTweets" :key="tweet.id"
          class="p-4 rounded-lg shadow-md mb-4 border border-gray-700">
          <div class="flex items-center space-x-2">
            <img :src="tweet.userAvatarUrl || 'https://via.placeholder.com/150'" alt="Avatar"
              class="w-8 h-8 rounded-full border border-white">
            <router-link :to="{ name: 'user-profile', params: { userId: tweet.userId } }" class="font-bold text-sm truncate">
              {{ tweet.displayName }}
            </router-link>
          </div>
          <p>{{ tweet.content }}</p>
          <p class="text-sm text-gray-400">{{ tweet.likes }} likes</p>
          <img v-if="tweet.imageUrl" :src="tweet.imageUrl" alt="Tweet Image"
            class="mt-2 rounded-lg max-w-full h-auto border border-gray-600" />
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';

const db = getFirestore();
const tweetsCollection = collection(db, 'tweets');
const usersCollection = collection(db, 'users');

const mostLikedTweets = ref([]);
const users = ref([]);
const following = ref([]);
const usersToFollow = ref([]);
const searchQuery = ref(''); // Adicionei a variável de estado para a barra de pesquisa

const loadMostLikedTweets = async () => {
  try {
    const q = query(tweetsCollection, orderBy('likes', 'desc'), limit(3));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDocs = await getDocs(usersCollection);
      const userMap = userDocs.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});

      mostLikedTweets.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          displayName: userMap[data.userId] ? userMap[data.userId].displayName : 'Unknown'
        };
      });
    }
  } catch (error) {
    console.error('Error loading most liked tweets: ', error);
  }
};

const loadUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    if (!querySnapshot.empty) {
      users.value = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      filterUsersToFollow();
    }
  } catch (error) {
    console.error('Error loading users: ', error);
  }
};

const loadFollowing = async () => {
  try {
    const currentUser = auth.currentUser;
    const followingSnapshot = await getDocs(collection(db, 'following', currentUser.uid, 'following'));
    following.value = followingSnapshot.docs.map(doc => doc.id);
    filterUsersToFollow();
  } catch (error) {
    console.error('Error loading following: ', error);
  }
};

const filterUsersToFollow = () => {
  const currentUser = auth.currentUser;
  usersToFollow.value = users.value.filter(user => user.uid !== currentUser.uid && !following.value.includes(user.uid));
};

const followUser = async (userId) => {
  try {
    const currentUser = auth.currentUser;
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

    following.value.push(userId);
    filterUsersToFollow();
  } catch (error) {
    console.error('Error following user: ', error);
  }
};

const isFollowing = (userId) => {
  return following.value.includes(userId);
};

const filteredUsers = computed(() => {
  if (searchQuery.value.trim() === '') {
    return [];
  }
  return users.value.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  await loadMostLikedTweets();
  await loadUsers();
  await loadFollowing();
});

</script>

<style scoped></style>
