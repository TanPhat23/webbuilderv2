import { jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
function ProtectedLayout() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
export {
  ProtectedLayout as component
};
