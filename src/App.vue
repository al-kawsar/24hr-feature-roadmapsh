<script setup>
import { RouterLink, RouterView } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <RouterView />
  </div>
</template>

<style scoped></style>
