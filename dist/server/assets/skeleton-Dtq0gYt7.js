import { jsx } from "react/jsx-runtime";
import { j as cn } from "./prisma-Cq49YOYM.js";
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
