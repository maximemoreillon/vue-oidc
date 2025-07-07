import type OidcClient from "@moreillon/oidc-auth";
import { ref } from "vue";

const client = ref<OidcClient | null>(null);
const user = ref<any>(null);
const access_token = ref<string | null>(null);

export default function () {
  return {
    client,
    user,
    access_token,
    login: client.value?.login,
    logout: client.value?.logout,
  };
}
