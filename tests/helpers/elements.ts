import type { EditorElement } from "@/types/global.type";
import type {
  TextElement,
  ImageElement,
  ButtonElement,
  InputElement,
  LinkElement,
  FrameElement,
  FormElement,
  SectionElement,
  CarouselElement,
  ListElement,
  SelectElement,
  CMSContentListElement,
  CMSContentItemElement,
  CMSContentGridElement,
} from "@/features/editor";

/**
 * Element helpers module
 * Provides factories and builders for creating mock elements in tests.
 * Organized into: leaf elements, containers, and tree builders.
 */

// ============================================================================
// ID Management
// ============================================================================

let idCounter = 0;

/**
 * Generates a unique mock ID for test elements.
 * Resets between tests via `resetMockIds()`.
 */
export function mockId(prefix = "el"): string {
  idCounter++;
  return `${prefix}-${idCounter}`;
}

/**
 * Resets the mock ID counter. Call in `beforeEach` if you need deterministic IDs.
 */
export function resetMockIds(): void {
  idCounter = 0;
}

// ============================================================================
// Base Element Factory
// ============================================================================

type MockElementOverrides = Partial<EditorElement> & {
  elements?: EditorElement[];
};

/**
 * Base factory for creating mock elements.
 * All specific element builders delegate to this function.
 */
function createMockBase(
  type: EditorElement["type"],
  overrides: MockElementOverrides = {},
): EditorElement {
  const id = overrides.id ?? mockId();
  return {
    id,
    type,
    content: "",
    styles: {},
    tailwindStyles: "",
    pageId: overrides.pageId ?? "page-1",
    parentId: overrides.parentId,
    elements: [],
    settings: null,
    ...overrides,
  } as EditorElement;
}

// ============================================================================
// Leaf Element Builders
// ============================================================================

/**
 * Creates a mock Text element.
 * @example
 * ```ts
 * const text = mockText({ content: "Hello" });
 * ```
 */
export function mockText(overrides: Partial<TextElement> = {}): TextElement {
  return createMockBase("Text", {
    content: "Hello world",
    ...overrides,
  }) as TextElement;
}

/**
 * Creates a mock Button element.
 */
export function mockButton(
  overrides: Partial<ButtonElement> = {},
): ButtonElement {
  return createMockBase("Button", {
    content: "Click me",
    ...overrides,
  }) as ButtonElement;
}

/**
 * Creates a mock Image element.
 */
export function mockImage(overrides: Partial<ImageElement> = {}): ImageElement {
  return createMockBase("Image", {
    content: "Image",
    src: "https://example.com/image.png",
    settings: { objectFit: "cover", loading: "lazy", decoding: "async" },
    ...overrides,
  }) as ImageElement;
}

/**
 * Creates a mock Input element.
 */
export function mockInput(overrides: Partial<InputElement> = {}): InputElement {
  return createMockBase("Input", {
    settings: { type: "text", placeholder: "Enter text..." },
    ...overrides,
  }) as InputElement;
}

/**
 * Creates a mock Link element.
 */
export function mockLink(overrides: Partial<LinkElement> = {}): LinkElement {
  return createMockBase("Link", {
    content: "Link text",
    href: "https://example.com",
    ...overrides,
  }) as LinkElement;
}

// ============================================================================
// Container Element Builders
// ============================================================================

/**
 * Creates a mock Frame element (container).
 */
export function mockFrame(overrides: Partial<FrameElement> = {}): FrameElement {
  return createMockBase("Frame", {
    elements: [],
    ...overrides,
  }) as FrameElement;
}

/**
 * Creates a mock Section element (container).
 */
export function mockSection(
  overrides: Partial<SectionElement> = {},
): SectionElement {
  return createMockBase("Section", {
    elements: [],
    ...overrides,
  }) as SectionElement;
}

/**
 * Creates a mock Form element with standard form settings.
 */
export function mockForm(overrides: Partial<FormElement> = {}): FormElement {
  return createMockBase("Form", {
    elements: [],
    settings: {
      method: "post",
      action: "",
      autoComplete: "on",
      encType: "application/x-www-form-urlencoded",
      target: "_self",
      validateOnSubmit: false,
      redirectUrl: "",
    },
    ...overrides,
  }) as FormElement;
}

/**
 * Creates a mock List element.
 */
export function mockList(overrides: Partial<ListElement> = {}): ListElement {
  return createMockBase("List", {
    elements: [],
    ...overrides,
  }) as ListElement;
}

/**
 * Creates a mock Select element.
 */
export function mockSelect(
  overrides: Partial<SelectElement> = {},
): SelectElement {
  return createMockBase("Select", {
    elements: [],
    ...overrides,
  }) as SelectElement;
}

/**
 * Creates a mock Carousel element.
 */
export function mockCarousel(
  overrides: Partial<CarouselElement> = {},
): CarouselElement {
  return createMockBase("Carousel", {
    elements: [],
    settings: { autoplay: true },
    ...overrides,
  }) as CarouselElement;
}

/**
 * Creates a mock CMSContentList element.
 */
export function mockCMSContentList(
  overrides: Partial<CMSContentListElement> = {},
): CMSContentListElement {
  return createMockBase("CMSContentList", {
    elements: [],
    settings: {
      contentTypeId: "",
      displayMode: "list",
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    ...overrides,
  }) as CMSContentListElement;
}

/**
 * Creates a mock CMSContentItem element.
 */
export function mockCMSContentItem(
  overrides: Partial<CMSContentItemElement> = {},
): CMSContentItemElement {
  return createMockBase("CMSContentItem", {
    elements: [],
    settings: { contentTypeId: "", itemSlug: "" },
    ...overrides,
  }) as CMSContentItemElement;
}

/**
 * Creates a mock CMSContentGrid element.
 */
export function mockCMSContentGrid(
  overrides: Partial<CMSContentGridElement> = {},
): CMSContentGridElement {
  return createMockBase("CMSContentGrid", {
    elements: [],
    settings: {
      contentTypeId: "",
      displayMode: "grid",
      limit: 6,
      sortBy: "createdAt",
      sortOrder: "desc",
      fieldsToShow: ["title", "content"],
    },
    ...overrides,
  }) as CMSContentGridElement;
}

// ============================================================================
// Tree & Structure Builders
// ============================================================================

/**
 * Creates a section with children already wired (parentId set).
 * Useful for quickly building nested test structures.
 *
 * @example
 * ```ts
 * const tree = mockTree(
 *   { id: "section-1" },
 *   [mockText({ id: "t1" }), mockButton({ id: "b1" })]
 * );
 * // tree.elements => [{ id: "t1", parentId: "section-1", ... }, ...]
 * ```
 */
export function mockTree(
  sectionOverrides: Partial<SectionElement> = {},
  children: EditorElement[] = [],
): SectionElement {
  const section = mockSection(sectionOverrides);
  const wiredChildren = children.map((child) => ({
    ...child,
    parentId: section.id,
    pageId: section.pageId,
  })) as EditorElement[];

  return {
    ...section,
    elements: wiredChildren,
  } as SectionElement;
}

/**
 * Creates a flat list of top-level elements (no nesting).
 * Useful for testing store operations on simple element arrays.
 *
 * @example
 * ```ts
 * const elements = mockFlatElements(5);
 * // Returns: [el-1, el-2, el-3, el-4, el-5]
 * ```
 */
export function mockFlatElements(count: number): EditorElement[] {
  return Array.from({ length: count }, (_, i) =>
    mockText({ id: `flat-${i + 1}`, content: `Text ${i + 1}` }),
  );
}

/**
 * Creates a deeply nested structure: Section → Frame → children.
 * Returns all components for assertion/traversal.
 *
 * @example
 * ```ts
 * const { root, frame, text, button } = mockNestedStructure();
 * // root contains frame, frame contains text and button
 * ```
 */
export function mockNestedStructure(): {
  root: SectionElement;
  frame: FrameElement;
  text: TextElement;
  button: ButtonElement;
} {
  const text = mockText({ id: "nested-text" });
  const button = mockButton({ id: "nested-button" });
  const frame = mockFrame({
    id: "nested-frame",
    elements: [
      { ...text, parentId: "nested-frame" } as EditorElement,
      { ...button, parentId: "nested-frame" } as EditorElement,
    ],
  });
  const root = mockSection({
    id: "nested-section",
    elements: [{ ...frame, parentId: "nested-section" } as EditorElement],
  });

  return { root, frame, text, button };
}

/**
 * Creates a complex multi-level structure for testing tree traversal.
 * Structure: Section → [Frame, Text] → Frame contains [Button, Input]
 */
export function mockComplexStructure(): {
  section: SectionElement;
  frame1: FrameElement;
  text1: TextElement;
  frame2: FrameElement;
  button: ButtonElement;
  input: InputElement;
} {
  const button = mockButton({ id: "complex-button" });
  const input = mockInput({ id: "complex-input" });
  const frame2 = mockFrame({
    id: "complex-frame-2",
    elements: [
      { ...button, parentId: "complex-frame-2" } as EditorElement,
      { ...input, parentId: "complex-frame-2" } as EditorElement,
    ],
  });
  const text1 = mockText({ id: "complex-text-1" });
  const frame1 = mockFrame({
    id: "complex-frame-1",
    elements: [
      { ...text1, parentId: "complex-frame-1" } as EditorElement,
      { ...frame2, parentId: "complex-frame-1" } as EditorElement,
    ],
  });
  const section = mockSection({
    id: "complex-section",
    elements: [{ ...frame1, parentId: "complex-section" } as EditorElement],
  });

  return { section, frame1, text1, frame2, button, input };
}
