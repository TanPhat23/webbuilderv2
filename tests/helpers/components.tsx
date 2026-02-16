import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import { vi } from "vitest";

/**
 * Components helpers module
 * Provides utilities for testing React components.
 */

// ============================================================================
// Custom Render Function
// ============================================================================

/**
 * Custom render function that wraps the standard testing-library render.
 * Can be extended with common providers (Redux, Theme, etc.)
 *
 * @example
 * ```ts
 * const { getByText } = renderComponent(<MyComponent />);
 * ```
 */
export function renderComponent(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { ...options });
}

// ============================================================================
// Mock Props Generators
// ============================================================================

/**
 * Creates mock props for a generic component.
 */
export function createMockComponentProps<T extends Record<string, any>>(
  overrides: Partial<T> = {},
): T {
  return {
    className: "mock-component",
    style: {},
    ...overrides,
  } as any as T;
}

/**
 * Creates mock props for a button component.
 */
export function createMockButtonProps(
  overrides: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>> = {},
) {
  return {
    type: "button" as const,
    onClick: vi.fn(),
    disabled: false,
    className: "mock-button",
    ...overrides,
  };
}

/**
 * Creates mock props for an input component.
 */
export function createMockInputProps(
  overrides: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {},
) {
  return {
    type: "text",
    value: "",
    onChange: vi.fn(),
    onBlur: vi.fn(),
    disabled: false,
    placeholder: "Enter text...",
    className: "mock-input",
    ...overrides,
  };
}

/**
 * Creates mock props for a form component.
 */
export function createMockFormProps(
  overrides: Partial<React.FormHTMLAttributes<HTMLFormElement>> = {},
) {
  return {
    onSubmit: vi.fn((e) => e.preventDefault()),
    onReset: vi.fn(),
    className: "mock-form",
    ...overrides,
  };
}

/**
 * Creates mock props for a select/dropdown component.
 */
export function createMockSelectProps(
  overrides: Partial<React.SelectHTMLAttributes<HTMLSelectElement>> = {},
) {
  return {
    onChange: vi.fn(),
    onBlur: vi.fn(),
    value: "",
    disabled: false,
    className: "mock-select",
    ...overrides,
  };
}

// ============================================================================
// Mock Callbacks & Event Handlers
// ============================================================================

/**
 * Creates a set of mock event handlers for testing interactions.
 */
export function createMockEventHandlers() {
  return {
    onClick: vi.fn(),
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onFocus: vi.fn(),
    onSubmit: vi.fn((e) => e?.preventDefault?.()),
    onReset: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
    onKeyDown: vi.fn(),
    onKeyUp: vi.fn(),
  };
}

/**
 * Creates mock keyboard event.
 */
export function createMockKeyboardEvent(
  key: string,
  overrides: Partial<React.KeyboardEvent> = {},
): Partial<React.KeyboardEvent> {
  return {
    key,
    code: key.toUpperCase(),
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  };
}

/**
 * Creates mock mouse event.
 */
export function createMockMouseEvent(
  type: string,
  overrides: Partial<React.MouseEvent> = {},
): Partial<React.MouseEvent> {
  return {
    type,
    clientX: 0,
    clientY: 0,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  };
}

/**
 * Creates mock change event.
 */
export function createMockChangeEvent(
  value: string,
  overrides: Partial<React.ChangeEvent<HTMLInputElement>> = {},
): Partial<React.ChangeEvent<HTMLInputElement>> {
  return {
    target: {
      value,
      ...overrides,
    } as any,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  };
}

// ============================================================================
// Component Wrapper Utilities
// ============================================================================

/**
 * Creates a wrapper component for testing with common providers.
 * Extend this pattern for your app's specific providers.
 */
export function createTestWrapper(
  providers: Array<React.ComponentType<{ children: React.ReactNode }>> = [],
) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    let wrapped = <>{children}</>;

    for (const Provider of providers) {
      wrapped = <Provider>{wrapped}</Provider>;
    }

    return wrapped;
  };
}

/**
 * Creates a simple suspense fallback for testing async components.
 */
export function createSuspenseFallback(message: string = "Loading...") {
  return <div data-testid="suspense-fallback">{message}</div>;
}

// ============================================================================
// Async Component Testing
// ============================================================================

/**
 * Helper for testing components with async state/data fetching.
 * Returns utilities for waiting and checking loading states.
 */
export function createAsyncComponentTester() {
  return {
    waitForLoadingToFinish: async (
      getByTestId: (id: string) => HTMLElement,
      timeout = 3000,
    ) => {
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        try {
          getByTestId("suspense-fallback");
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch {
          return true; // Loading finished
        }
      }
      return false;
    },

    simulateAsyncData: async <T,>(data: T, delay = 100): Promise<T> => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return data;
    },
  };
}

// ============================================================================
// Snapshot Testing Helpers
// ============================================================================

/**
 * Creates a snapshot of rendered component output.
 */
export function createComponentSnapshot(element: HTMLElement): {
  html: string;
  text: string;
  testId: string | null;
} {
  return {
    html: element.outerHTML,
    text: element.textContent || "",
    testId: element.getAttribute("data-testid"),
  };
}

/**
 * Compares two component snapshots for differences.
 */
export function compareComponentSnapshots(
  before: ReturnType<typeof createComponentSnapshot>,
  after: ReturnType<typeof createComponentSnapshot>,
) {
  return {
    htmlChanged: before.html !== after.html,
    textChanged: before.text !== after.text,
    testIdChanged: before.testId !== after.testId,
  };
}

// ============================================================================
// Accessibility Testing Helpers
// ============================================================================

/**
 * Verifies basic accessibility attributes on a component.
 */
export function verifyAccessibility(element: HTMLElement) {
  return {
    hasAriaLabel: element.hasAttribute("aria-label"),
    hasAriaLabelledBy: element.hasAttribute("aria-labelledby"),
    hasAriaDescribedBy: element.hasAttribute("aria-describedby"),
    hasRole: element.hasAttribute("role"),
    role: element.getAttribute("role"),
    isKeyboardAccessible: ["BUTTON", "A", "INPUT", "SELECT"].includes(
      element.tagName,
    ),
  };
}

/**
 * Creates mock aria attributes for testing.
 */
export function createMockAriaAttributes(
  overrides: Partial<Record<string, string>> = {},
) {
  return {
    "aria-label": "Mock component",
    "aria-describedby": "description",
    "aria-hidden": "false",
    role: "button",
    tabIndex: 0,
    ...overrides,
  };
}

// ============================================================================
// User Interaction Helpers
// ============================================================================

/**
 * Helper for simulating user interactions in tests.
 */
export function createUserInteractionSimulator() {
  return {
    clickElement: async (element: HTMLElement) => {
      element.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    },

    typeInInput: async (element: HTMLInputElement, text: string) => {
      element.focus();
      element.value = text;
      element.dispatchEvent(new Event("change", { bubbles: true }));
      element.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    },

    submitForm: async (form: HTMLFormElement) => {
      form.dispatchEvent(new Event("submit", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    },

    selectOption: async (select: HTMLSelectElement, value: string) => {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    },

    hoverElement: async (element: HTMLElement) => {
      element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    },

    unhoverElement: async (element: HTMLElement) => {
      element.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
  };
}

// ============================================================================
// Component Query Helpers
// ============================================================================

/**
 * Helper for common component queries and assertions.
 */
export function createComponentQueryHelper(container: HTMLElement) {
  return {
    findByTestId: (testId: string) => {
      return container.querySelector(
        `[data-testid="${testId}"]`,
      ) as HTMLElement | null;
    },

    findAllByTestId: (testId: string) => {
      return Array.from(
        container.querySelectorAll(`[data-testid="${testId}"]`),
      );
    },

    findByText: (text: string) => {
      return Array.from(container.querySelectorAll("*")).find(
        (el) => el.textContent === text,
      ) as HTMLElement | null;
    },

    findByRole: (role: string) => {
      return container.querySelector(`[role="${role}"]`) as HTMLElement | null;
    },

    hasClass: (selector: string, className: string) => {
      const element = container.querySelector(selector);
      return element?.classList.contains(className) ?? false;
    },

    getTextContent: () => container.textContent ?? "",

    getHtml: () => container.innerHTML,
  };
}
