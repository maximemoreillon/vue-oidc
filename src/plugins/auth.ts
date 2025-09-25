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

export default {
  async install(app: App, options: Options) {
    const { enforce, ...oidcOptions } = options;
    const auth = useAuth();

    auth.client.value = new OidcClient(oidcOptions);
    const oidcData = await auth.client.value.init(enforce);

    if (!enforce || oidcData) auth.ready.value = true;
    if (!oidcData) return;

    const {
      user,
      tokens: { access_token },
    } = oidcData;

    auth.access_token.value = access_token;
    auth.user.value = user;

    auth.client.value.onTokenRefreshed(({ access_token }) => {
      auth.access_token.value = access_token;
    });
  },
};
