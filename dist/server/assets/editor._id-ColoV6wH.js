import { jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
import { E as EditorProvider } from "./editorprovider-R8xfLE4-.js";
import { b as Route } from "./router-C8tq5DJa.js";
import "react";
import "./prisma-Cq49YOYM.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "lucide-react";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "./SelectComponent-t_K3xf5i.js";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-DZpoDDoq.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-BDhK7YnG.js";
import "./checkbox-BX2VzNwa.js";
import "yjs";
import "y-indexeddb";
import "events";
import "y-protocols/awareness";
import "./accordion-Dg3retHz.js";
import "cmdk";
import "./select-CPjHyyea.js";
import "./page-Cy1amgId.js";
import "./scroll-area-BYa8i-Jn.js";
import "./card-LOcGasZb.js";
import "./dropdown-menu-B0s9PypA.js";
import "date-fns";
import "./avatar-vyaRObia.js";
import "@clerk/react/internal";
import "./index-CSLGDVeV.js";
import "@clerk/shared/error";
import "./env-VSwWZfm9.js";
import "@clerk/shared/getEnvVariable";
import "@clerk/shared/underscore";
import "./auth-BkVoR3zB.js";
import "@clerk/backend/internal";
import "@clerk/backend";
import "@babel/generator";
import "@babel/types";
function EditorLayout() {
  const {
    userId
  } = Route.useRouteContext();
  const {
    id
  } = Route.useParams();
  return /* @__PURE__ */ jsx(EditorProvider, { projectId: id, userId, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  EditorLayout as component
};
