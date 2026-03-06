import { buildErrorThrower } from "@clerk/shared/error";
var isClient = () => typeof window !== "undefined";
var errorThrower = buildErrorThrower({
  packageName: "@clerk/tanstack-react-start"
});
export {
  errorThrower as e,
  isClient as i
};
