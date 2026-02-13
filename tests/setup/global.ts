import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

/**
 * Global test setup file for all vitest suites.
 * Centralizes mocking of external dependencies and global test configuration.
 */

// ============================================================================
// Environment Setup
// ============================================================================

// Ensure we're running in test mode
process.env.NODE_ENV = "test";

// ============================================================================
// Mock next/navigation
// ============================================================================

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// ============================================================================
// Mock @clerk/nextjs
// ============================================================================

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    userId: "test-user-id",
    isSignedIn: true,
    isLoaded: true,
  }),
  useUser: () => ({
    user: { id: "test-user-id", fullName: "Test User" },
    isSignedIn: true,
    isLoaded: true,
  }),
}));

// ============================================================================
// Mock sonner toast
// ============================================================================

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// ============================================================================
// Mock uuid - provide deterministic IDs in tests
// ============================================================================

let uuidCounter = 0;
vi.mock("uuid", () => ({
  v4: () => {
    uuidCounter++;
    return `test-uuid-${uuidCounter}`;
  },
}));

// Reset uuid counter before each test
beforeEach(() => {
  uuidCounter = 0;
  vi.clearAllMocks();
});
