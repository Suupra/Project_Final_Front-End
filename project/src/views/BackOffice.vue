<template>
  <div class="backoffice-container">
    <h1>Backoffice</h1>
    <nav>
      <router-link to="/backoffice/users">Gestão de Utilizadores</router-link>
      <router-link to="/backoffice/tweets">Gestão de Tweets</router-link>
      <router-link to="/">Voltar</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
</script>

<style scoped>
.backoffice-container {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
}

h1 {
  font-size: 24px;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

nav {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

nav a {
  margin: 0 15px;
  padding: 10px 15px;
  text-decoration: none;
  color: #007bff;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.3s ease;
}

nav a:hover {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}

nav a.router-link-active {
  background-color: #0056b3;
  color: #fff;
  border-color: #0056b3;
}
</style>
