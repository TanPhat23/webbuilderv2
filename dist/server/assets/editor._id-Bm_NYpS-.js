import { jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
import { E as EditorProvider } from "./editorprovider-C0ucQMtg.js";
import { b as Route } from "./router-BlPuUPbX.js";
import "react";
import "./project.service-Bci2lGYe.js";
import "./prisma-BUnO9f9X.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
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
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "./SelectComponent-Bh8IGRc1.js";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-CEa84Ygm.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-D5_jSc2n.js";
import "./checkbox-Cs4k79tJ.js";
import "yjs";
import "y-indexeddb";
import "events";
import "y-protocols/awareness";
import "./accordion-D43pR8IL.js";
import "cmdk";
import "./select-CPf1Vtyb.js";
import "./page-Cy1amgId.js";
import "./scroll-area-D0pODww5.js";
import "./card-D42cGFKZ.js";
import "./dropdown-menu-Bk3fcYaf.js";
import "date-fns";
import "./avatar-BTnsTn8t.js";
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
