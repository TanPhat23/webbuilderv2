import { vi } from "vitest";

/**
 * Utilities helpers module
 * Provides general-purpose utility functions for testing.
 */

// ============================================================================
// Async/Promise Utilities
// ============================================================================

/**
 * Creates a resolved promise with optional delay.
 * Useful for simulating async operations in tests.
 *
 * @example
 * ```ts
 * const result = await resolveAfter(100, "data");
 * ```
 */
export function resolveAfter<T>(delayMs: number, value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delayMs);
  });
}

/**
 * Creates a rejected promise with optional delay.
 */
export function rejectAfter<T extends Error>(
  delayMs: number,
  error: T,
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delayMs);
  });
}

/**
 * Waits for a condition to be true or times out.
 * Useful for testing async state changes.
 *
 * @example
 * ```ts
 * await waitFor(() => {
 *   expect(element).toBeVisible();
 * }, 3000);
 * ```
 */
export async function waitFor(
  condition: () => boolean | void,
  timeoutMs: number = 3000,
  pollIntervalMs: number = 50,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      if (condition()) {
        return;
      }
    } catch {
      // Condition threw, try again
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

/**
 * Waits for a function to not throw an error.
 */
export async function waitForNoThrow(
  fn: () => void | Promise<void>,
  timeoutMs: number = 3000,
): Promise<void> {
  return waitFor(
    () => {
      try {
        fn();
        return true;
      } catch {
        return false;
      }
    },
    timeoutMs,
  );
}

// ============================================================================
// Mock Function Utilities
// ============================================================================

/**
 * Creates a mock function that tracks all calls and results.
 */
export function createTrackingMock<T extends (...args: any[]) => any>(
  implementation?: T,
) {
  const calls: Array<{ args: any[]; result?: any; error?: Error }> = [];

  const mock = vi.fn((...args: any[]) => {
    try {
      const result = implementation?.(...args);
      calls.push({ args, result });
      return result;
    } catch (error) {
      calls.push({ args, error: error as Error });
      throw error;
    }
  });

  return {
    mock,
    calls,
    getCallCount: () => calls.length,
    getLastCall: () => calls[calls.length - 1],
    getFirstCall: () => calls[0],
    getCallAt: (index: number) => calls[index],
    getCalls: () => [...calls],
    reset: () => {
      calls.length = 0;
      mock.mockClear();
    },
  };
}

/**
 * Creates a mock function that returns different values on successive calls.
 */
export function createSequenceMock<T>(values: T[]) {
  let callIndex = 0;
  return {
    mock: vi.fn(() => {
      const value = values[callIndex % values.length];
      callIndex++;
      return value;
    }),
    reset: () => {
      callIndex = 0;
    },
  };
}

/**
 * Creates a spy that wraps an existing function.
 */
export function createSpy<T extends (...args: any[]) => any>(fn: T) {
  const calls: any[] = [];
  const spy = vi.fn((...args: any[]) => {
    calls.push(args);
    return fn(...args);
  });

  return {
    spy,
    calls,
    getCallCount: () => calls.length,
    wasCalledWith: (...expectedArgs: any[]) => {
      return calls.some((args) =>
        JSON.stringify(args) === JSON.stringify(expectedArgs),
      );
    },
  };
}

// ============================================================================
// Data Generation Utilities
// ============================================================================

/**
 * Generates a random ID string.
 */
export function generateRandomId(prefix: string = "id"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates an array of random data.
 */
export function generateRandomArray<T>(
  generator: () => T,
  length: number = 10,
): T[] {
  return Array.from({ length }, () => generator());
}

/**
 * Creates a mock UUID.
 */
export function mockUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates mock pagination parameters.
 */
export function mockPaginationParams(
  page: number = 1,
  limit: number = 10,
  total: number = 100,
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  };
}

// ============================================================================
// Object/Array Utilities
// ============================================================================

/**
 * Deep clones an object.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep compares two objects for equality.
 */
export function deepEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Flattens a nested array.
 */
export function flattenArray<T>(arr: any[]): T[] {
  return arr.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenArray(item) : item);
  }, []);
}

/**
 * Groups array items by a key function.
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Creates a diff between two objects.
 */
export function diffObjects<T extends Record<string, any>>(
  before: T,
  after: T,
): { added: Partial<T>; removed: Partial<T>; modified: Partial<T> } {
  const added: any = {};
  const removed: any = {};
  const modified: any = {};

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  allKeys.forEach((key) => {
    const beforeVal = before[key];
    const afterVal = after[key];

    if (beforeVal === undefined && afterVal !== undefined) {
      added[key] = afterVal;
    } else if (beforeVal !== undefined && afterVal === undefined) {
      removed[key] = beforeVal;
    } else if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      modified[key] = { before: beforeVal, after: afterVal };
    }
  });

  return { added, removed, modified };
}

// ============================================================================
// Error/Exception Utilities
// ============================================================================

/**
 * Creates a mock error with custom message and code.
 */
export function createMockError(
  message: string = "Mock error",
  code: string = "MOCK_ERROR",
) {
  const error = new Error(message);
  (error as any).code = code;
  return error;
}

/**
 * Expects a function to throw a specific error.
 */
export async function expectToThrow<T extends Error>(
  fn: () => void | Promise<void>,
  ErrorType: new (...args: any[]) => T,
): Promise<T> {
  try {
    await fn();
    throw new Error(
      `Expected function to throw ${ErrorType.name}, but it didn't`,
    );
  } catch (error) {
    if (error instanceof ErrorType) {
      return error;
    }
    throw error;
  }
}

/**
 * Wraps a function to catch and return errors instead of throwing.
 */
export function tryCatch<T, E extends Error = Error>(
  fn: () => T,
): { success: true; value: T } | { success: false; error: E } {
  try {
    return { success: true, value: fn() };
  } catch (error) {
    return { success: false, error: error as E };
  }
}

// ============================================================================
// Performance Testing Utilities
// ============================================================================

/**
 * Measures execution time of a function.
 */
export function measureExecutionTime<T>(
  fn: () => T,
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Measures async function execution time.
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Creates a performance benchmark suite.
 */
export function createBenchmark(name: string) {
  const measurements: { name: string; duration: number }[] = [];

  return {
    measure: <T,>(label: string, fn: () => T): T => {
      const { result, duration } = measureExecutionTime(fn);
      measurements.push({ name: label, duration });
      return result;
    },

    measureAsync: async <T,>(label: string, fn: () => Promise<T>): Promise<T> => {
      const { result, duration } = await measureAsyncExecutionTime(fn);
      measurements.push({ name: label, duration });
      return result;
    },

    report: () => {
      console.log(`\n=== Benchmark: ${name} ===`);
      measurements.forEach(({ name: label, duration }) => {
        console.log(`  ${label}: ${duration.toFixed(2)}ms`);
      });
      const total = measurements.reduce((sum, m) => sum + m.duration, 0);
      console.log(`  Total: ${total.toFixed(2)}ms\n`);
      return measurements;
    },
  };
}

// ============================================================================
// Validation/Assertion Utilities
// ============================================================================

/**
 * Validates that a value matches expected shape.
 */
export function validateShape<T>(
  value: any,
  expectedKeys: (keyof T)[],
): value is T {
  if (typeof value !== "object" || value === null) return false;
  return expectedKeys.every((key) => key in value);
}

/**
 * Creates a type guard function.
 */
export function createTypeGuard<T>(
  predicate: (value: unknown) => boolean,
): (value: unknown) => value is T {
  return (value: unknown): value is T => predicate(value);
}

/**
 * Validates an array of items against a schema.
 */
export function validateArray<T>(
  arr: unknown,
  validator: (item: unknown) => item is T,
): arr is T[] {
  return Array.isArray(arr) && arr.every((item) => validator(item));
}

// ============================================================================
// Mock Data Utilities
// ============================================================================

/**
 * Creates a mock API response.
 */
export function mockApiResponse<T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {},
) {
  return {
    status,
    headers,
    data,
    ok: status >= 200 && status < 300,
  };
}

/**
 * Creates a mock API error response.
 */
export function mockApiErrorResponse(
  message: string = "API Error",
  status: number = 500,
) {
  return {
    status,
    ok: false,
    error: {
      message,
      code: `HTTP_${status}`,
    },
  };
}

/**
 * Creates mock pagination response.
 */
export function mockPaginatedResponse<T>(
  items: T[],
  page: number = 1,
  limit: number = 10,
  total: number = 100,
) {
  return {
    data: items,
    pagination: mockPaginationParams(page, limit, total),
  };
}
