# Vue OIDC

Vue 3 plugin and composable for OpenID Connect authentication, built on [@moreillon/oidc-auth](https://www.npmjs.com/package/@moreillon/oidc-auth).

## Installation

```bash
npm install @moreillon/vue-oidc
```

`vue` (^3.5) is a peer dependency.

## Setup

```ts
import { createApp } from "vue";
import { auth } from "@moreillon/vue-oidc";
import App from "./App.vue";

const { VITE_OIDC_AUTHORITY, VITE_OIDC_CLIENT_ID } = import.meta.env;

createApp(App)
  .use(auth, {
    authority: VITE_OIDC_AUTHORITY,
    client_id: VITE_OIDC_CLIENT_ID,
  })
  .mount("#app");
```

### Options

| Option             | Type                     | Description                                                                      |
| ------------------ | ------------------------ | -------------------------------------------------------------------------------- |
| `authority`        | `string`                 | URL of the OIDC provider (required)                                              |
| `client_id`        | `string`                 | OIDC client ID (required)                                                        |
| `redirect_uri`     | `string`                 | Where the provider redirects after login. Defaults to the current page           |
| `extraQueryParams` | `Record<string, string>` | Additional query parameters sent to the authorization endpoint                   |
| `enforce`          | `boolean`                | Redirect unauthenticated users to the provider immediately instead of letting them in anonymously |

## Usage

Initialization is asynchronous and the app mounts before it finishes, so wait for `ready` before rendering anything that depends on authentication:

```vue
<script setup lang="ts">
import { useAuth } from "@moreillon/vue-oidc";

const { ready, error, user, login, logout } = useAuth();
</script>

<template>
  <p v-if="!ready">Loading...</p>
  <p v-else-if="error">Authentication failed: {{ error }}</p>
  <template v-else-if="user">
    <p>Hello {{ user.name }}</p>
    <button @click="logout">Log out</button>
  </template>
  <button v-else @click="login">Log in</button>
</template>
```

### `useAuth()`

All refs are read-only.

| Property       | Type                              | Description                                                                 |
| -------------- | --------------------------------- | --------------------------------------------------------------------------- |
| `ready`        | `Ref<boolean>`                    | `true` once initialization has finished (successfully or not)               |
| `error`        | `Ref<unknown>`                    | Error thrown during initialization, if any                                  |
| `user`         | `Ref<User \| null>`               | User info of the authenticated user                                         |
| `access_token` | `Ref<string \| null>`             | Current access token, kept up to date on refresh                            |
| `client`       | `Ref<OidcClient \| null>`         | Underlying `@moreillon/oidc-auth` client                                    |
| `login()`      | `() => void`                      | Redirect to the provider's login page                                       |
| `logout()`     | `() => void`                      | Log out at the provider                                                     |

`useAuth` accepts a type parameter for custom claims: `useAuth<MyUser>()`.

The state is shared at module level, so `useAuth()` also works outside components, e.g. in router guards or API clients:

```ts
const { access_token } = useAuth();
fetch("/api/items", {
  headers: { Authorization: `Bearer ${access_token.value}` },
});
```
