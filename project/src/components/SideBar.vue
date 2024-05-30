<template>
  <div class="w-1/4 bg-black text-white p-4 h-screen fixed top-0 flex flex-col space-y-4 pl-10 pt-2">
    <div class="flex">
      <img src="@/assets/Logo_of_Twitter.svg.png" alt="Logo" class="logo"> <!-- Ajuste de tamanho -->
    </div>
    <ul class="space-y-4">
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="home" class="w-6 h-6"/>
        <router-link to="/" class="text-xl font-semibold">Página Inicial</router-link>
      </li>
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="search" class="w-6 h-6"/>
        <router-link to="/" class="text-xl font-semibold">Explorar</router-link>
      </li>
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="bell" class="w-6 h-6"/>
        <router-link to="/" class="text-xl font-semibold">Notificações</router-link>
      </li>
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="envelope" class="w-6 h-6"/>
        <router-link to="/" class="text-xl font-semibold">Mensagens</router-link>
      </li>
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="bookmark" class="w-6 h-6"/>
        <router-link to="/" class="text-xl font-semibold">Itens salvos</router-link>
      </li>
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="user-friends" class="w-6 h-6"/>
        <router-link to="/" class="text-xl font-semibold">Comunidades</router-link>
      </li>
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="gem" class="w-6 h-6"/>
        <router-link to="/" class="text-xl font-semibold">Premium</router-link>
      </li>
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="user" class="w-6 h-6"/>
        <router-link to="/Perfil" class="text-xl font-semibold">Perfil</router-link>
      </li>
      <li class="flex items-center space-x-3">
        <font-awesome-icon icon="ellipsis-h" class="w-6 h-6"/>
        <router-link to="/" class="text-xl font-semibold">Mais</router-link>
      </li>
      <li v-if="isAdmin" class="flex items-center space-x-3">
        <font-awesome-icon icon="gear" class="w-6 h-6"/>
        <router-link to="/backoffice" class="text-xl font-semibold">BackOffice</router-link>
      </li>
    </ul>
    <button class="bg-blue-500 text-white px-4 py-2 rounded-full mt-4">Postar</button>
    <ProfileCard/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProfileCard from './ProfileCard.vue';

const auth = getAuth();
const isAdmin = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user && user.email === 'admin@gmail.com') {
      isAdmin.value = true;
    } else {
      isAdmin.value = false;
    }
  });
});
</script>

<style scoped>
.logo {
  width: 100px;
}
</style>
