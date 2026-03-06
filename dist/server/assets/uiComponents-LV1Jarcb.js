import { SignUp as SignUp$1, SignIn as SignIn$1, UserProfile, OrganizationProfile, OrganizationList } from "@clerk/react";
import { useRoutingProps } from "@clerk/react/internal";
import { useParams, useLocation } from "@tanstack/react-router";
import { useRef } from "react";
import { jsx } from "react/jsx-runtime";
var usePathnameWithoutSplatRouteParams = () => {
  const { _splat } = useParams({
    strict: false
  });
  const { pathname } = useLocation();
  const splatRouteParam = _splat || "";
  const path = pathname.replace(splatRouteParam, "").replace(/\/$/, "").replace(/^\//, "").trim();
  const computedPath = `/${path}`;
  const stablePath = useRef(computedPath);
  return stablePath.current;
};
Object.assign(
  (props) => {
    const path = usePathnameWithoutSplatRouteParams();
    return /* @__PURE__ */ jsx(UserProfile, { ...useRoutingProps("UserProfile", props, { path }) });
  },
  { ...UserProfile }
);
Object.assign(
  (props) => {
    const path = usePathnameWithoutSplatRouteParams();
    return /* @__PURE__ */ jsx(OrganizationProfile, { ...useRoutingProps("OrganizationProfile", props, { path }) });
  },
  { ...OrganizationProfile }
);
Object.assign(
  (props) => {
    const path = usePathnameWithoutSplatRouteParams();
    return /* @__PURE__ */ jsx(OrganizationList, { ...useRoutingProps("OrganizationList", props, { path }) });
  },
  { ...OrganizationList }
);
var SignIn = (props) => {
  const path = usePathnameWithoutSplatRouteParams();
  return /* @__PURE__ */ jsx(SignIn$1, { ...useRoutingProps("SignIn", props, { path }) });
};
var SignUp = (props) => {
  const path = usePathnameWithoutSplatRouteParams();
  return /* @__PURE__ */ jsx(SignUp$1, { ...useRoutingProps("SignUp", props, { path }) });
};
export {
  SignUp as S,
  SignIn as a
};
