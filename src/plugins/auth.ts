import type { App } from "vue";
import useAuth from "../composables/useAuth";
import OidcClient from "@moreillon/oidc-auth";

let oidcClient: OidcClient;

export default {
  async install(app: App, options: any) {
    const auth = useAuth();
    oidcClient = new OidcClient(options);
    const oidcData = await oidcClient.init();

    if (!oidcData) return;

    auth.user.value = oidcData.user;
    auth.access_token.value = oidcData.access_token;

    oidcClient.onTokenRefreshed(({ access_token }) => {
      auth.access_token.value = access_token;
    });
  },
};
