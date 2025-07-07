# Vue OIDC

## Usage example

```ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import { auth } from "@moreillon/vue-oidc";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

const { VITE_OIDC_AUTHORITY, VITE_OIDC_CLIENT_ID } = import.meta.env;

app.use(auth, {
  authority: VITE_OIDC_AUTHORITY,
  client_id: VITE_OIDC_CLIENT_ID,
});
app.use(createPinia());
app.use(router);

app.mount("#app");
```

Then in your components:

```vue
<script setup lang="ts">
import { useAuth } from "@moreillon/vue-oidc";

const { user } = useAuth();
</script>

<template>
  <h1>User</h1>
  <p>
    {{ user }}
  </p>
</template>
```
