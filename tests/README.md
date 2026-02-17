# Testing Infrastructure

Centralized testing infrastructure for the WebBuilder project. This directory contains all shared test utilities, fixtures, and setup files organized by domain.

## 📁 Directory Structure

```
tests/
├── setup/
│   └── global.ts              # Global test setup, mocks, and configuration
├── helpers/
│   ├── index.ts               # Central export point for all helpers
│   ├── elements.ts            # Element builders and factories
│   ├── styles.ts              # Style/CSS mock helpers
│   ├── store.ts               # Zustand store testing utilities
│   ├── components.ts          # Component rendering and interaction helpers
│   └── utilities.ts           # General-purpose test utilities
├── fixtures/
│   └── (reserved for static test data files)
└── README.md                  # This file
```

## 🚀 Quick Start

### Basic Element Testing

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { 
  mockText, 
  mockButton, 
  mockSection,
  mockNestedStructure,
  resetMockIds 
} from "tests/helpers";

describe("Element operations", () => {
  beforeEach(() => {
    resetMockIds();
  });

  it("should create mock elements", () => {
    const text = mockText({ content: "Hello" });
    const button = mockButton({ id: "btn-1" });
    
    expect(text.type).toBe("Text");
    expect(button.content).toBe("Click me");
  });

  it("should build nested structures", () => {
    const { root, frame, text, button } = mockNestedStructure();
    expect(root.elements).toContain(frame);
    expect(frame.elements).toHaveLength(2);
  });
});
```

### Store Testing

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { 
  createMockStoreGetter,
  createMockElementStoreState,
  createStoreActionTester 
} from "tests/helpers";

describe("Element store", () => {
  it("should manage store state", () => {
    const store = createMockStoreGetter(createMockElementStoreState());
    
    store.setState({ elements: [mockText()] });
    expect(store.getState().elements).toHaveLength(1);
  });
});
```

### Component Testing

```typescript
import { describe, it, expect } from "vitest";
import { renderComponent, createMockButtonProps } from "tests/helpers";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("should render button", () => {
    const props = createMockButtonProps({ onClick: vi.fn() });
    const { getByRole } = renderComponent(<MyComponent {...props} />);
    
    expect(getByRole("button")).toBeInTheDocument();
  });
});
```

## 📚 Helpers Reference

### Elements (`tests/helpers/elements.ts`)

**ID Management:**
- `mockId(prefix?)` - Generate unique mock IDs
- `resetMockIds()` - Reset ID counter between tests

**Leaf Elements:**
- `mockText(overrides?)` - Create Text element
- `mockButton(overrides?)` - Create Button element
- `mockImage(overrides?)` - Create Image element
- `mockInput(overrides?)` - Create Input element
- `mockLink(overrides?)` - Create Link element

**Container Elements:**
- `mockFrame(overrides?)` - Create Frame element
- `mockSection(overrides?)` - Create Section element
- `mockForm(overrides?)` - Create Form with settings
- `mockList(overrides?)` - Create List container
- `mockSelect(overrides?)` - Create Select element
- `mockCarousel(overrides?)` - Create Carousel element
- `mockCMSContentList(overrides?)` - Create CMS list
- `mockCMSContentItem(overrides?)` - Create CMS item
- `mockCMSContentGrid(overrides?)` - Create CMS grid

**Tree Builders:**
- `mockTree(overrides?, children)` - Section with wired children
- `mockFlatElements(count)` - Flat array of elements
- `mockNestedStructure()` - Section → Frame → children
- `mockComplexStructure()` - Multi-level nested structure

### Styles (`tests/helpers/styles.ts`)

**Responsive Styles:**
- `mockResponsiveStyles(overrides?)` - Basic responsive styles
- `mockResponsiveStylesWithBreakpoints(overrides?)` - Mobile/tablet/desktop

**Tailwind:**
- `mockTailwindClasses(classes?)` - Create Tailwind class string
- `mockResponsiveTailwindClasses()` - Responsive Tailwind classes

**CSS Properties:**
- `mockTextStyles(overrides?)` - Text element styles
- `mockButtonStyles(overrides?)` - Button element styles
- `mockContainerStyles(overrides?)` - Container/section styles
- `mockFlexStyles(overrides?)` - Flexbox styles
- `mockGridStyles(overrides?)` - CSS Grid styles
- `mockPositioningStyles(overrides?)` - Position properties
- `mockShadowStyles(overrides?)` - Shadow and depth

**Utilities:**
- `mergeStyles(...styles)` - Merge multiple style objects
- `cssVar(name)` - Create CSS variable reference
- `mockTheme()` - Theme object with colors, spacing, typography

### Store (`tests/helpers/store.ts`)

**Store Mocking:**
- `createMockStoreGetter(initialState)` - Basic store mock
- `createMockStoreWithSelectors(initialState)` - Store with selector support

**Element Store:**
- `createMockElementStoreState()` - Element store initial state
- `createMockElementStoreStateWithElements(elements)` - Populated state
- `verifyStoreMutation(before, after, expectedChanges)` - Verify state changes

**Selection Store:**
- `createMockSelectionStoreState()` - Selection store initial state
- `createMockSelectionStoreStateWithSelection(ids)` - With selected elements

**Mouse/Interaction:**
- `createMockMouseStoreState()` - Mouse store initial state
- `createMockMousePosition(x, y)` - Mouse position
- `createMockDragState(isDragging, offsetX, offsetY)` - Drag state

**Page Store:**
- `createMockPageStoreState()` - Page store initial state

**Action Testing:**
- `createStoreActionTester(getState)` - Batch test store actions

**Snapshots:**
- `createStoreSnapshot(state)` - Create state snapshot
- `compareSnapshots(before, after)` - Compare snapshots for differences

**Selectors:**
- `createMockSelector(selectorFn)` - Mock selector
- `createElementStoreSelectors()` - Common element store selectors
- `createSelectionStoreSelectors()` - Common selection store selectors

### Components (`tests/helpers/components.ts`)

**Rendering:**
- `renderComponent(ui, options?)` - Custom render function
- `createTestWrapper(providers?)` - Create provider wrapper

**Props:**
- `createMockComponentProps(overrides?)` - Generic component props
- `createMockButtonProps(overrides?)` - Button props with onClick
- `createMockInputProps(overrides?)` - Input props
- `createMockFormProps(overrides?)` - Form props
- `createMockSelectProps(overrides?)` - Select/dropdown props

**Events:**
- `createMockEventHandlers()` - Set of event handlers
- `createMockKeyboardEvent(key, overrides?)` - Keyboard event
- `createMockMouseEvent(type, overrides?)` - Mouse event
- `createMockChangeEvent(value, overrides?)` - Change event

**User Interaction:**
- `createUserInteractionSimulator()` - Helper for simulating clicks, typing, etc.

**Queries:**
- `createComponentQueryHelper(container)` - Query utilities

**Accessibility:**
- `verifyAccessibility(element)` - Check a11y attributes
- `createMockAriaAttributes(overrides?)` - Mock aria props

**Async:**
- `createAsyncComponentTester()` - Test async components

**Snapshots:**
- `createComponentSnapshot(element)` - Snapshot component state
- `compareComponentSnapshots(before, after)` - Compare snapshots

### Utilities (`tests/helpers/utilities.ts`)

**Async/Promise:**
- `resolveAfter(delayMs, value)` - Resolve promise with delay
- `rejectAfter(delayMs, error)` - Reject promise with delay
- `waitFor(condition, timeoutMs?, pollIntervalMs?)` - Wait for condition
- `waitForNoThrow(fn, timeoutMs?)` - Wait for no error

**Mocks:**
- `createTrackingMock(implementation?)` - Mock with call tracking
- `createSequenceMock(values)` - Mock with sequence of return values
- `createSpy(fn)` - Spy wrapper around function

**Data Generation:**
- `generateRandomId(prefix?)` - Random ID
- `generateRandomArray(generator, length?)` - Array of random data
- `mockUUID()` - Mock UUID
- `mockPaginationParams(page?, limit?, total?)` - Pagination params

**Object/Array:**
- `deepClone(obj)` - Deep clone
- `deepEqual(a, b)` - Deep equality check
- `flattenArray(arr)` - Flatten nested arrays
- `groupBy(arr, keyFn)` - Group by function
- `diffObjects(before, after)` - Find differences

**Errors:**
- `createMockError(message?, code?)` - Mock error
- `expectToThrow(fn, ErrorType)` - Expect specific error
- `tryCatch(fn)` - Catch and return errors

**Performance:**
- `measureExecutionTime(fn)` - Measure sync function time
- `measureAsyncExecutionTime(fn)` - Measure async function time
- `createBenchmark(name)` - Benchmark suite

**Validation:**
- `validateShape(value, expectedKeys)` - Type guard for shape
- `createTypeGuard(predicate)` - Create custom type guard
- `validateArray(arr, validator)` - Validate array items

**API Mocks:**
- `mockApiResponse(data, status?, headers?)` - Mock successful response
- `mockApiErrorResponse(message?, status?)` - Mock error response
- `mockPaginatedResponse(items, page?, limit?, total?)` - Mock paginated response

## 🔧 Global Setup (`tests/setup/global.ts`)

The global setup file automatically configures:

- **Environment**: Sets `NODE_ENV = "test"`
- **next/navigation**: Mocks useRouter, useParams, useSearchParams, usePathname
- **@clerk/nextjs**: Mocks useAuth and useUser
- **sonner**: Mocks toast notifications
- **uuid**: Mocks v4 with deterministic IDs
- **Testing Library**: Imports jest-dom matchers
- **Cleanup**: Clears mocks before each test

No additional setup needed in your test files!

## 📝 Test File Organization

Place test files next to the code they test:

```
src/
├── lib/
│   ├── utils/
│   │   ├── element/
│   │   │   ├── elementhelper.ts
│   │   │   ├── __tests__/
│   │   │   │   └── elementhelper.test.ts
│   │   │   ├── create/
│   │   │   │   ├── ElementFactory.ts
│   │   │   │   └── __tests__/
│   │   │   │       └── ElementFactory.test.ts
```

## ✨ Best Practices

### 1. **Use beforeEach for Setup**
```typescript
beforeEach(() => {
  resetMockIds();
  // Reset store/state as needed
});
```

### 2. **Leverage Helper Functions**
Instead of manually creating elements:
```typescript
// ❌ Don't do this
const element = { id: "el-1", type: "Text", content: "Hi", ... };

// ✅ Do this
const element = mockText({ content: "Hi" });
```

### 3. **Test One Thing Per Test**
```typescript
// ✅ Good
it("should find element by id", () => { ... });
it("should not find non-existent element", () => { ... });

// ❌ Avoid
it("should handle all scenarios", () => { ... });
```

### 4. **Use Descriptive Names**
```typescript
// ✅ Good
const parent = mockSection({ id: "parent-section" });
const child = mockText({ id: "child-text", parentId: "parent-section" });

// ❌ Avoid
const s = mockSection();
const t = mockText();
```

### 5. **Group Related Tests**
```typescript
describe("elementHelper.findById", () => {
  it("should find top-level element");
  it("should find nested element");
  it("should return undefined for missing element");
});
```

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📊 Coverage Goals

Current coverage includes:
- **elementHelper**: 86 tests
- **ElementFactory**: 126 tests
- **handleSwap**: 17 tests
- **element-store**: 61 tests
- **errorToast**: 35 tests
- **queryConfig**: 19 tests

**Total: 344 tests**

## 🚦 Common Patterns

### Testing Store Selectors
```typescript
const store = createMockStoreGetter(
  createMockElementStoreState()
);
const selector = createElementStoreSelectors().selectElement("el-1");
const element = selector(store.getState());
```

### Testing Nested Operations
```typescript
const { root, frame, text, button } = mockNestedStructure();
const allElements = [root, frame, text, button];
const found = elementHelper.findById(allElements, "nested-button");
expect(found?.id).toBe("nested-button");
```

### Testing Async Operations
```typescript
it("should handle async data", async () => {
  const data = await resolveAfter(100, { success: true });
  expect(data.success).toBe(true);
});
```

## 🔍 Debugging Tests

Enable verbose output:
```bash
npm run test -- --reporter=verbose
```

Run single test file:
```bash
npm run test -- elementhelper.test.ts
```

Run tests matching pattern:
```bash
npm run test -- --grep "findById"
```

## 📖 Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Zustand Testing Guide](https://docs.pmnd.rs/zustand/guides/testing)
