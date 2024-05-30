<template>
    <div class="w-2/4 mx-auto pt-4">
      <div class="bg-black text-white p-4 rounded-lg shadow-md mb-4 border border-gray-700">
        <h2 class="text-lg font-bold mb-4">Perfil</h2>
        <div class="flex items-center space-x-4 mb-4">
          <img :src="userPhotoURL || 'https://via.placeholder.com/150'" alt="User Avatar" class="w-20 h-20 rounded-full border border-white">
          <input type="file" @change="onFileChange" class="hidden" ref="fileInput" />
          <button @click="triggerFileInput" class="bg-blue-500 text-white px-4 py-2 rounded-full">Alterar Foto</button>
        </div>
        <div v-if="imagePreview" class="mt-2">
            <img :src="imagePreview" alt="Image Preview" class="max-w-full h-auto rounded-lg border border-gray-600" />
          </div>
        <div class="mb-4">
          <label class="block text-gray-400 mb-2" for="name">Nome</label>
          <input v-model="userName" id="name" type="text" class="bg-gray-800 text-white w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <button @click="updateProfile" class="bg-blue-500 text-white px-4 py-2 rounded-full">Salvar Alterações</button>
        <button><router-link to="/">Voltar</router-link></button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { getAuth, updateProfile as updateAuthProfile } from 'firebase/auth';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { doc, updateDoc, getFirestore } from 'firebase/firestore';
  
  const auth = getAuth();
  const storage = getStorage();
  const db = getFirestore();
  
  const currentUser = auth.currentUser;
  const userName = ref(currentUser.displayName);
  const userPhotoURL = ref(currentUser.photoURL);
  
  const file = ref(null);
  const fileInput = ref(null);
  const imagePreview = ref(null);
  
  const triggerFileInput = () => {
    fileInput.value.click();
  };
  
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
  
  const updateProfile = async () => {
    try {
      let photoURL = userPhotoURL.value;
      if (file.value) {
        const fileRef = storageRef(storage, `profile_pictures/${currentUser.uid}`);
        await uploadBytes(fileRef, file.value);
        photoURL = await getDownloadURL(fileRef);
      }
  
      await updateAuthProfile(currentUser, {
        displayName: userName.value,
        photoURL: photoURL,
      });
  
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, {
        displayName: userName.value,
        photoURL: photoURL,
      });
  
      userPhotoURL.value = photoURL;
      alert('Perfil atualizado com sucesso!');
      imagePreview.value = null;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    }
  };
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
  .focus\:ring-2:focus {
    box-shadow: 0 0 0 2px #2563eb;
  }
  .focus\:ring-blue-500:focus {
    box-shadow: 0 0 0 2px #2563eb;
  }
  </style>
  