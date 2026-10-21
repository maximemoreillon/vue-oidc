import type OidcClient from "@moreillon/oidc-auth";
import type { User } from "@moreillon/oidc-auth";
import { computed, readonly, ref, shallowRef } from "vue";

// Module-level state so that useAuth() also works outside of components
// (e.g. in router navigation guards). Only the plugin may write to it.
export const state = {
  client: shallowRef<OidcClient | null>(null),
  user: ref<User | null>(null),
  access_token: ref<string | null>(null),
  ready: ref(false),
  error: shallowRef<unknown>(null),
};

export function resetState() {
  state.client.value = null;
  state.user.value = null;
  state.access_token.value = null;
  state.ready.value = false;
  state.error.value = null;
}

function getClient() {
  if (!state.client.value) throw new Error("OIDC Client not instantiated");
  return state.client.value;
}

function login() {
  getClient().login();
}

function logout() {
  getClient().logout();
}

export default function useAuth<T extends User = User>() {
  return {
    ready: readonly(state.ready),
    error: computed(() => state.error.value),
    client: computed(() => state.client.value),
    user: computed(() => state.user.value as T | null),
    access_token: readonly(state.access_token),
    login,
    logout,
  };
}
