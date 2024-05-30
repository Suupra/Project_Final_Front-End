<template>
  <div >
    <SideBar />
    <Feed />
    <Trends />
  </div>
</template>

<script setup>
import SideBar from '../components/SideBar.vue'
import Feed from '../components/Feed.vue'
import Trends from '../components/Trends.vue'
</script>

<style>
body {
  background-color: #000000;
}
</style>
