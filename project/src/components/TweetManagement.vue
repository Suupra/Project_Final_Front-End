<template>
  <div>
    <h2>Gestão de Tweets</h2>
    <div v-for="tweet in tweets" :key="tweet.id" class="tweet-card">
      <div>
        <p><strong>Autor:</strong> {{ tweet.email }}</p>
        <p>{{ tweet.content }}</p>
      </div>
      <div class="actions">
        <button @click="editTweet(tweet.id)" class="action-button edit">
          <font-awesome-icon icon="edit" />
        </button>
        <button @click="deleteTweet(tweet.id)" class="action-button delete">
          <font-awesome-icon icon="trash" /> 
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../main';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const tweets = ref([]);

const fetchTweets = async () => {
  try {
    const tweetsCollection = collection(db, 'tweets');
    const tweetsSnapshot = await getDocs(tweetsCollection);
    tweets.value = tweetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao buscar tweets: ', error);
  }
};

const editTweet = async (tweetId) => {
  const newContent = prompt("Digite o novo conteúdo do tweet:");
  if (newContent) {
    const tweetDoc = doc(db, 'tweets', tweetId);
    await updateDoc(tweetDoc, { content: newContent });
    fetchTweets();
  }
};

const deleteTweet = async (tweetId) => {
  if (confirm("Tem certeza que deseja excluir este tweet?")) {
    const tweetDoc = doc(db, 'tweets', tweetId);
    await deleteDoc(tweetDoc);
    fetchTweets();
  }
};

onMounted(() => {
  fetchTweets();
});
</script>

<style scoped>
.tweet-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.tweet-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.actions {
  display: flex;
  gap: 10px;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.action-button.edit {
  background-color: #4caf50;
  color: white;
}

.action-button.edit:hover {
  background-color: #45a049;
}

.action-button.delete {
  background-color: #f44336;
  color: white;
}

.action-button.delete:hover {
  background-color: #e53935;
}

.action-button font-awesome-icon {
  margin-right: 6px;
}
</style>
