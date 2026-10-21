import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "vue";
import { auth, useAuth } from "../src";

const mocks = vi.hoisted(() => ({
  init: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  onTokenRefreshed: vi.fn(),
  onRefreshError: vi.fn(),
  onLogout: vi.fn(),
}));

vi.mock("@moreillon/oidc-auth", () => ({
  default: vi.fn(function () {
    return mocks;
  }),
  TokenRejectedError: class extends Error {},
}));

const options = { authority: "https://idp.example.com", client_id: "app" };
const oidcData = {
  user: { name: "Jane", email: "jane@example.com" },
  tokens: { access_token: "token-1" },
};

const install = (extra = {}) =>
  auth.install(createApp({}), { ...options, ...extra });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth plugin", () => {
  it("populates user and token when authenticated", async () => {
    mocks.init.mockResolvedValue(oidcData);
    await install();

    const { ready, user, access_token, error } = useAuth();
    expect(ready.value).toBe(true);
    expect(user.value).toEqual(oidcData.user);
    expect(access_token.value).toBe("token-1");
    expect(error.value).toBeNull();
  });

  it("is ready without a user when not enforced and not authenticated", async () => {
    mocks.init.mockResolvedValue(undefined);
    await install();

    const { ready, user } = useAuth();
    expect(ready.value).toBe(true);
    expect(user.value).toBeNull();
  });

  it("stays not ready when enforced and redirecting to the provider", async () => {
    mocks.init.mockResolvedValue(undefined);
    await install({ enforce: true });

    expect(mocks.init).toHaveBeenCalledWith(true);
    expect(useAuth().ready.value).toBe(false);
  });

  it("does not pass enforce to the OIDC client", async () => {
    const { default: OidcClient } = await import("@moreillon/oidc-auth");
    mocks.init.mockResolvedValue(undefined);
    await install({ enforce: true });

    expect(OidcClient).toHaveBeenCalledWith(options);
  });

  it("exposes init errors instead of hanging", async () => {
    const failure = new Error("network down");
    mocks.init.mockRejectedValue(failure);
    await install();

    const { ready, error } = useAuth();
    expect(ready.value).toBe(true);
    expect(error.value).toBe(failure);
  });

  it("updates the access token on refresh", async () => {
    mocks.init.mockResolvedValue(oidcData);
    await install();

    const [handler] = mocks.onTokenRefreshed.mock.calls[0];
    handler({ access_token: "token-2" });
    expect(useAuth().access_token.value).toBe("token-2");
  });

  it("exposes refresh errors and clears them on the next refresh", async () => {
    mocks.init.mockResolvedValue(oidcData);
    await install();

    const failure = new Error("invalid_grant");
    const [onError] = mocks.onRefreshError.mock.calls[0];
    onError(failure);
    expect(useAuth().error.value).toBe(failure);

    const [onRefreshed] = mocks.onTokenRefreshed.mock.calls[0];
    onRefreshed({ access_token: "token-2" });
    expect(useAuth().error.value).toBeNull();
  });

  it("clears the user when the session ends outside of this tab", async () => {
    mocks.init.mockResolvedValue(oidcData);
    await install();

    const [onLogout] = mocks.onLogout.mock.calls[0];
    onLogout();

    const { user, access_token } = useAuth();
    expect(user.value).toBeNull();
    expect(access_token.value).toBeNull();
  });

  it("delegates login and logout to the client", async () => {
    mocks.init.mockResolvedValue(undefined);
    await install();

    const { login, logout } = useAuth();
    login();
    logout();
    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.logout).toHaveBeenCalledOnce();
  });
});
