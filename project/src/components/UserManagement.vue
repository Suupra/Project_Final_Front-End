<template>
  <div>
    <h2>Gestão de Utilizadores</h2>
    <div v-for="user in filteredUsers" :key="user.uid" class="user-card">
      <div>
        <p><strong>Nome:</strong> {{ user.displayName }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
      </div>
      <div class="actions">
        <button @click="editUser(user.uid)" class="action-button edit">
          <font-awesome-icon icon="edit" />
        </button>
        <button @click="deleteUser(user.uid)" class="action-button delete">
          <font-awesome-icon icon="trash" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, deleteUser as deleteFirebaseUser } from 'firebase/auth';
import { db } from '../main';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const users = ref([]);

const fetchUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    users.value = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });
  } catch (error) {
    console.error('Erro ao buscar usuários: ', error);
  }
};

const editUser = async (userId) => {
  const newDisplayName = prompt("Digite o novo nome de usuário:");
  if (newDisplayName) {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { displayName: newDisplayName });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao editar usuário: ', error);
    }
  }
};

const deleteUser = async (userId) => {
  if (confirm("Tem certeza que deseja excluir este usuário?")) {
    try {
      // Exclui o usuário do Firestore
      const userDoc = doc(db, 'users', userId);
      await deleteDoc(userDoc);

      const auth = getAuth();
      const user = auth.currentUser;

      if (user && user.uid === userId) {
        // Exclui o usuário do Firebase Authentication
        await deleteFirebaseUser(user);
      } else {
        console.error('Você só pode excluir o usuário autenticado atualmente.');
      }

      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário: ', error);
    }
  }
};

const filteredUsers = computed(() => {
  return users.value.filter(user => user.email !== 'admin@gmail.com');
});

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-card {
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

.user-card:hover {
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
