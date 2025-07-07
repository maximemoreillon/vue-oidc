import type { App } from "vue";
import useAuth from "../composables/useAuth";
import OidcClient from "@moreillon/oidc-auth";

export type Options = {
  authority: string;
  client_id: string;
  extraQueryParams?: { [key: string]: string };
  redirect_uri?: string;
  enforce?: boolean;
};

let oidcClient: OidcClient;

export default {
  async install(app: App, options: Options) {
    const { enforce, ...oidcOptions } = options;
    const auth = useAuth();
    oidcClient = new OidcClient(oidcOptions);
    const oidcData = await oidcClient.init(enforce);

    if (!oidcData) return;

    const {
      user,
      tokens: { access_token },
    } = oidcData;

    auth.user.value = user;
    auth.access_token.value = access_token;

    oidcClient.onTokenRefreshed(({ access_token }) => {
      auth.access_token.value = access_token;
    });
  },
};
