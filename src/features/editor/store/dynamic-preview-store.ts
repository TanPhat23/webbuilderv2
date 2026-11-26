import { create } from "zustand";

interface DynamicPreviewState {
  readonly selectedItemSlugByPage: Readonly<Record<string, string>>;
  readonly sampleParamsByPage: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
  readonly setSelectedItemSlug: (pageId: string, slug: string) => void;
  readonly setSampleParam: (pageId: string, name: string, value: string) => void;
  readonly resetPagePreview: (pageId: string) => void;
}

export const useDynamicPreviewStore = create<DynamicPreviewState>((set) => ({
  selectedItemSlugByPage: {},
  sampleParamsByPage: {},
  setSelectedItemSlug: (pageId, slug) =>
    set((state) => ({
      selectedItemSlugByPage: {
        ...state.selectedItemSlugByPage,
        [pageId]: slug,
      },
    })),
  setSampleParam: (pageId, name, value) =>
    set((state) => ({
      sampleParamsByPage: {
        ...state.sampleParamsByPage,
        [pageId]: {
          ...(state.sampleParamsByPage[pageId] ?? {}),
          [name]: value,
        },
      },
    })),
  resetPagePreview: (pageId) =>
    set((state) => {
      const nextItems = { ...state.selectedItemSlugByPage };
      const nextParams = { ...state.sampleParamsByPage };
      delete nextItems[pageId];
      delete nextParams[pageId];
      return {
        selectedItemSlugByPage: nextItems,
        sampleParamsByPage: nextParams,
      };
    }),
}));
