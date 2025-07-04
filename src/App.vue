<script setup lang="ts">
import useAuth from "@/composables/useAuth";

const auth = useAuth();
</script>

<template>
  <main>
    <h1>Home</h1>
    <p>User: {{ auth.user }}</p>
    <p>Access token: {{ auth.access_token }}</p>
  </main>
</template>
