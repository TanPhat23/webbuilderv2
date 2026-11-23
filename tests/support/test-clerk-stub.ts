/** Controllable stand-in for `@clerk/tanstack-react-start` used in hook tests. */
export interface StubAuth {
  userId: string | null | undefined;
  isLoaded: boolean;
}
export const authState: StubAuth = { userId: null, isLoaded: true };
export const userState: { user: unknown; isLoaded: boolean } = { user: null, isLoaded: true };

export const useAuth = () => ({ ...authState });
export const useUser = () => ({ ...userState });
export const ClerkProvider = ({ children }: { children?: unknown }) => children as never;
export const SignIn = () => null;
export const SignUp = () => null;
export const SignOutButton = ({ children }: { children?: unknown }) => children as never;
