/** Controllable `@clerk/tanstack-react-start/server`. */
export const serverAuth: { userId: string | null; token: string | null } = {
  userId: 'user-1',
  token: 'tok-1',
};
export const auth = async () => ({
  userId: serverAuth.userId,
  getToken: async () => serverAuth.token,
});
export const clerkMiddleware = () => undefined;
