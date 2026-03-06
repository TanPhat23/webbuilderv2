import { jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
function AuthLayout() {
  return /* @__PURE__ */ jsx("main", { className: "w-full h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  AuthLayout as component
};
