/** `@clerk/tanstack-react-start/server` whose auth() also reports isAuthenticated. */
export const serverAuth: { userId: string | null; token: string | null } = {
  userId: 'user-1',
  token: 'tok-1',
};
export const auth = async () => ({
  isAuthenticated: serverAuth.userId !== null,
  userId: serverAuth.userId,
  getToken: async () => serverAuth.token,
});
export const clerkMiddleware = () => undefined;
