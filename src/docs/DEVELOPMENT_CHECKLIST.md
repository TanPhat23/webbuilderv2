# Development Checklist

## Before Committing

- [ ] Build passes: `bun run build`
- [ ] Types are correct: `bun run type-check`
- [ ] No unused imports
- [ ] JSDoc comments added for public APIs
- [ ] Error handling is consistent (use `showErrorToast` utility)
- [ ] Element types use constants, not string literals
- [ ] No new `any` types introduced (use `unknown` or proper types)
- [ ] React Query hooks use shared cache config from `@/lib/utils/query/queryConfig`

## Before Creating PR

- [ ] All tests pass
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG updated (if applicable)
- [ ] No breaking changes introduced
- [ ] Commit messages are descriptive

## Code Review Checklist

- [ ] Types are correct and specific (no unnecessary `any`)
- [ ] Error handling is consistent (`showErrorToast` / `showSuccessToast`)
- [ ] Functions have JSDoc comments
- [ ] Tests cover happy path and edge cases
- [ ] No prop drilling — use context or composition where appropriate
- [ ] Hooks follow established patterns (permissions, error handling)
- [ ] Query cache settings use shared constants

---

## Adding a New Element Type

1. Add to `ALL_ELEMENT_TYPES` in `src/constants/elements.ts`
2. Add to `CONTAINER_ELEMENT_TYPES` or `EDITABLE_ELEMENT_TYPES` if applicable
3. Add icon to `ELEMENT_ICON_MAP`
4. Add label to `ELEMENT_LABELS`
5. Create interface in `src/interfaces/elements.interface.ts`
6. Add to `ElementTypeMap` in interfaces
7. Add to `EditorElement` union type in interfaces
8. Create strategy in `src/lib/utils/element/create/elementCreateStrategy.ts`
9. Register strategy in `src/lib/utils/element/create/elementStrategyMap.ts`
10. Create editor component in `src/components/editor/editorcomponents/`
11. Register in `getComponentFactory()` in `src/constants/elements.ts`
12. Create preview component in `src/components/preview/` (if needed)
13. Register in `getPreviewComponentMap()` in `src/constants/previewComponents.ts`
14. Create code generation strategy in `generatestrategies.ts` (if needed)

Everything else (ElementType union, elementHolders array, etc.) derives automatically.

---

## Error Handling Patterns

### Toast notifications

```typescript
import { showErrorToast, showSuccessToast } from "@/lib/utils/errors/errorToast";

// Simple error
showErrorToast("Failed to save element");

// From caught error
try {
  await saveElement();
} catch (error) {
  showErrorToast(error);
}

// Success
showSuccessToast("Element saved");
```

### Read-only mode errors

```typescript
import { showReadOnlyToast } from "@/lib/utils/errors/errorToast";

if (!permissions.canEditElements) {
  showReadOnlyToast("edit");
  return;
}
```

---

## React Query Cache Settings

```typescript
import { QUERY_CACHE_CONFIG } from "@/lib/utils/query/queryConfig";

useQuery({
  queryKey: ["my-data"],
  queryFn: fetchData,
  ...QUERY_CACHE_CONFIG.standard,
});
```

Available presets:
- `QUERY_CACHE_CONFIG.standard` — 5 min stale, 30 min gc
- `QUERY_CACHE_CONFIG.long` — 15 min stale, 1 hr gc
- `QUERY_CACHE_CONFIG.short` — 1 min stale, 5 min gc
- `QUERY_CACHE_CONFIG.realtime` — 0 stale, 1 min gc

---

## File Organization

```
src/
├── components/
│   ├── editor/          # Editor-mode components
│   │   └── editorcomponents/  # Per-element editor components
│   └── preview/         # Preview-mode components
├── constants/           # Constants, element config, component maps
├── docs/                # Developer documentation
├── globalstore/         # Zustand stores
├── hooks/               # React hooks (editor, cms, features)
├── interfaces/          # TypeScript interfaces & types
├── lib/
│   └── utils/
│       ├── element/     # Element utilities & factory
│       │   └── create/  # ElementFactory, strategies, strategy map
│       ├── errors/      # Error handling utilities
│       └── query/       # React Query config
├── services/            # API service layer
└── types/               # Global type aliases & re-exports
```
