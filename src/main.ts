import { createApp } from "vue";
import { auth } from "@/index";
import App from "./App.vue";

const app = createApp(App);

const { VITE_OIDC_AUTHORITY, VITE_OIDC_CLIENT_ID, VITE_OIDC_AUDIENCE } =
  import.meta.env;

app.use(auth, {
  authority: VITE_OIDC_AUTHORITY,
  client_id: VITE_OIDC_CLIENT_ID,
  extraQueryParams: { audience: VITE_OIDC_AUDIENCE },
});
app.mount("#app");
