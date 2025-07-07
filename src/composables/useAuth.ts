import type OidcClient from "@moreillon/oidc-auth";
import { ref } from "vue";

const client = ref<OidcClient | null>(null);
const user = ref<any>(null);
const access_token = ref<string | null>(null);

function login() {
  if (!client.value) throw new Error("OIDC Client not instanciated");
  client.value.login();
}

function logout() {
  if (!client.value) throw new Error("OIDC Client not instanciated");
  client.value.logout();
}

export default function () {
  return {
    client,
    user,
    access_token,
    login,
    logout,
  };
}
