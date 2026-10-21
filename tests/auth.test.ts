import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "vue";
import { auth, useAuth } from "../src";

const mocks = vi.hoisted(() => ({
  init: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  onTokenRefreshed: vi.fn(),
}));

vi.mock("@moreillon/oidc-auth", () => ({
  default: vi.fn(function () {
    return mocks;
  }),
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
