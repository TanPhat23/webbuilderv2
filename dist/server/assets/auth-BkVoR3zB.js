import { getAuthObjectForAcceptedToken } from "@clerk/backend/internal";
import { e as errorThrower } from "./index-CSLGDVeV.js";
import { a as getStartContext } from "../server.js";
const getGlobalStartContext = () => {
  const context = getStartContext().contextAfterGlobalMiddlewares;
  if (!context) {
    throw new Error(`Global context not set yet, you are calling getGlobalStartContext() before the global middlewares are applied.`);
  }
  return context;
};
var createErrorMessage = (msg) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord

`;
};
createErrorMessage(`
  You're calling 'getAuth()' from a server function, without providing the request object.
  Example:

  export const someServerFunction = createServerFn({ method: 'GET' }).handler(async () => {
    const request = getWebRequest()
    const auth = getAuth(request);
    ...
  });
  `);
var clerkMiddlewareNotConfigured = createErrorMessage(`
It looks like you're trying to use Clerk without configuring the middleware.

To fix this, make sure you have the \`clerkMiddleware()\` configured in your \`createStart()\` function in your \`src/start.ts\` file.`);
var auth = (async (opts) => {
  const authObjectFn = getGlobalStartContext().auth;
  if (!authObjectFn) {
    return errorThrower.throw(clerkMiddlewareNotConfigured);
  }
  const authObject = await Promise.resolve(authObjectFn({ treatPendingAsSignedOut: opts?.treatPendingAsSignedOut }));
  return getAuthObjectForAcceptedToken({ authObject, acceptsToken: opts?.acceptsToken });
});
export {
  auth as a,
  getGlobalStartContext as g
};
