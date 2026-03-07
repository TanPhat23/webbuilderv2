import { jsx } from "react/jsx-runtime";
import { h as cn } from "./prisma-BUnO9f9X.js";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("bg-accent animate-pulse rounded-md", className),
      ...props
    }
  );
}
export {
  Skeleton as S
};
