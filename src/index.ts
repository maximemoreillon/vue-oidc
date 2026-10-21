import auth from "./plugins/auth.js";
import useAuth from "./composables/useAuth.js";
export { auth, useAuth };
export type { Options } from "./plugins/auth.js";
export { TokenRejectedError } from "@moreillon/oidc-auth";
export type { User, Tokens } from "@moreillon/oidc-auth";
