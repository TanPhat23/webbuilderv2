import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { redirect } from "@tanstack/react-router";
import { a as auth } from "./auth-BkVoR3zB.js";
import { c as createServerFn } from "../server.js";
import "@clerk/backend/internal";
import "./index-CSLGDVeV.js";
import "@clerk/shared/error";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const authStateFn_createServerFn_handler = createServerRpc({
  id: "88d5d58f001fd825f4c5fcff598166a8d2276446ffd1cacf558ba926f8fce389",
  name: "authStateFn",
  filename: "src/features/auth/lib/api.ts"
}, (opts) => authStateFn.__executeServer(opts));
const authStateFn = createServerFn().handler(authStateFn_createServerFn_handler, async () => {
  const {
    isAuthenticated,
    userId
  } = await auth();
  if (!isAuthenticated) {
    throw redirect({
      to: "/sign-in"
    });
  }
  return {
    userId
  };
});
export {
  authStateFn_createServerFn_handler
};
