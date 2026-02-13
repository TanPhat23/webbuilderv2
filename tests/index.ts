/**
 * Central export point for all testing utilities.
 *
 * This file re-exports all test helpers and setup utilities from their respective modules,
 * making them easily accessible from a single import path.
 *
 * @example
 * ```ts
 * // Instead of:
 * import { mockText } from "tests/helpers/elements";
 * import { mockResponsiveStyles } from "tests/helpers/styles";
 * import { createMockStoreGetter } from "tests/helpers/store";
 *
 * // You can now do:
 * import { mockText, mockResponsiveStyles, createMockStoreGetter } from "tests";
 * ```
 */

// Re-export all helpers
export * from "./helpers";

// Re-export setup utilities (if needed in test files)
export { default as globalSetup } from "./setup/global";
