import { createApp } from "vue";
import { createPinia } from "pinia";
import auth from "./plugins/auth";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

const { VITE_OIDC_AUTHORITY, VITE_OIDC_CLIENT_ID, VITE_OIDC_AUDIENCE } =
  import.meta.env;

app.use(createPinia());
app.use(router);
app.use(auth, {
  authority: VITE_OIDC_AUTHORITY,
  client_id: VITE_OIDC_CLIENT_ID,
  extraQueryParams: { audience: VITE_OIDC_AUDIENCE },
});
app.mount("#app");
