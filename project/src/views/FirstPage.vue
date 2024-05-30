<template>
    <div class="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div class="flex items-center mb-10">
        <img src="@/assets/Logo_of_Twitter.svg.png" alt="Logo" class="w-36 h-36">
      </div>
      <h1 class="text-5xl font-bold mb-10">Acontecendo agora</h1>
      <h2 class="text-3xl font-semibold mb-6">Inscreva-se hoje</h2>
      <div class="flex flex-col space-y-4 mb-4">
      </div>
      <button class="bg-blue-500 text-white font-semibold py-2 px-4 rounded-full mb-6" @click="goToRegister">
        Criar conta
      </button>
      <p class="text-gray-400 text-sm mb-6">
        Ao se inscrever, você concorda com os <a href="#" class="text-blue-400">Termos de Serviço</a> e a <a href="#" class="text-blue-400">Política de Privacidade</a>, incluindo o <a href="#" class="text-blue-400">Uso de Cookies</a>.
      </p>
      <div class="text-lg mb-4">Já tem uma conta?</div>
      <button class="bg-transparent border border-blue-500 text-blue-500 font-semibold py-2 px-4 rounded-full" @click="goToSignIn">
        Entrar
      </button>
    </div>
  </template>
  
  <script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToRegister = () => {
    router.push('/Register');
};
const goToSignIn = () => {
    router.push('/Sign-in');
};
</script>
  
  <style scoped>
  </style>
  