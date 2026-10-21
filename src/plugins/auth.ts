import type { App } from "vue";
import OidcClient from "@moreillon/oidc-auth";
import type { UserProvidedOptions } from "@moreillon/oidc-auth";
import { resetState, state } from "../composables/useAuth.js";

export type Options = UserProvidedOptions & {
  enforce?: boolean;
};

async function init(options: Options) {
  const { enforce, ...oidcOptions } = options;

  resetState();

  try {
    const client = new OidcClient(oidcOptions);
    state.client.value = client;

    const oidcData = await client.init(enforce);

    if (oidcData) {
      state.access_token.value = oidcData.tokens.access_token;
      state.user.value = oidcData.user;

      client.onTokenRefreshed(({ access_token }) => {
        state.access_token.value = access_token;
      });
    }

    // When enforced without data, the user is being redirected to the provider
    if (!enforce || oidcData) state.ready.value = true;
  } catch (error) {
    state.error.value = error;
    state.ready.value = true;
  }
}

export default {
  // Vue does not await plugin installation: returned promise is for tests / callers
  // who want to wait. Apps should rely on the `ready` ref from useAuth().
  install(_app: App, options: Options) {
    return init(options);
  },
};
