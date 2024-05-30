<template>
    <div class="flex items-center p-4 bg-gray-800 rounded-lg relative">
      <div>
        <div class="text-gray-400">{{ email }}</div>
        <div  v-if="!user" class="text-gray-400" @click="goToLogin">Iniciar sessão</div>
      </div>
      <div class="ml-auto relative">
        <font-awesome-icon 
          icon="ellipsis-h" 
          class="text-gray-400 cursor-pointer" 
          @click="toggleMenu"
        />
        <div v-if="showMenu" class="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg z-10">
          <div v-if="user" 
            class="block px-4 py-2 text-gray-400 cursor-pointer" 
            @click="logout"
          >
            Logout
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  
  const profilePicture = ref('')
  const email = ref('')
  const showMenu = ref(false)
  const router = useRouter()
  const user = ref(null)
  
  onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (userAuth) => {
    user.value = userAuth
    if (user.value) {
      email.value = user.value.email
    } else {
      email.value = ''
    }
  })
})
  
  const toggleMenu = () => {
    showMenu.value = !showMenu.value
  }
  
  const logout = () => {
    const auth = getAuth()
    signOut(auth).then(() => {
      router.push('/')
    }).catch((error) => {
      console.error("Error signing out: ", error)
    })
  }

  const goToLogin = () => {
    router.push('/MainPage')
  }
  </script>
  
  <style scoped>
  </style>
  