import { Page } from "@/features/pages";
import { projectService } from "@/features/projects";
import { create } from "zustand";

type PageCollaborativeData = Partial<Page> | Page | undefined;

/**
 * Type definition for the Zustand PageStore.
 */
type PageStore = {
  // State
  pages: Page[];

  currentPage: Page | null;

  collaborativeCallback:
    | ((
        type: "update" | "delete" | "create",
        id?: string,
        data?: PageCollaborativeData,
      ) => void)
    | null;

  /**
   * Update a page by its ID with new styles/data.
   * @param updatedPage The updated Page object.
   * @param id The ID of the page to update.
   */
  // Actions
  addPage: (newPage: Page) => void;

  updatePage: (updates: Partial<Page>, id: string) => void;

  deletePage: (id: string) => Promise<void>;
  /**
   * Reset all pages to an empty array.
   */
  resetPage: () => void;
  /**
   * Load a set of pages into the store.
   * @param pages The array of Page objects to load.
   */
  loadPages: (pages: Page[]) => void;

  setCurrentPage: (page: Page | null) => void;

  setCollaborativeCallback: (
    callback:
      | ((
          type: "update" | "delete" | "create",
          id?: string,
          data?: PageCollaborativeData,
        ) => void)
      | null,
  ) => void;
};

export const usePageStore = create<PageStore>((set, get) => {
  const triggerCollaborativeCallback = (
    type: "update" | "delete" | "create",
    id?: string,
    data?: PageCollaborativeData,
  ) => {
    const { collaborativeCallback } = get();
    if (collaborativeCallback && typeof collaborativeCallback === "function") {
      collaborativeCallback(type, id, data);
    }
  };

  return {
    pages: [], // initial state
    currentPage: null,
    collaborativeCallback: null,

    updatePage: (updates, id) => {
      set((state) => ({
        pages: state.pages.map((page) =>
          page.Id === id ? { ...page, ...updates } : page,
        ),
      }));
      // TODO: Optionally, call an API to persist the update
      triggerCollaborativeCallback("update", id, updates);
    },
    addPage: (newPage) => {
      set((state) => ({
        pages: [...state.pages, newPage],
      }));
      triggerCollaborativeCallback("create", newPage.Id, newPage);
    },

    deletePage: async (id) => {
      const pagesCopy = get().pages;
      const pageToDelete = pagesCopy.find((page) => page.Id === id);
      set((state) => ({
        pages: state.pages.filter((page) => page.Id !== id),
      }));
      if (pageToDelete) {
        const result = await projectService.deleteProjectPage(
          pageToDelete?.ProjectId,
          id,
        );
        if (!result) {
          set({ pages: pagesCopy });
        } else {
          triggerCollaborativeCallback("delete", id);
        }
      }
    },

    resetPage: () => {
      set({ pages: [] });
      // TODO: Optionally, call an API to reset pages on the backend
    },
    loadPages: (pages) => {
      set({ pages });
      // TODO: Optionally, call an API to fetch pages if needed
    },

    setCurrentPage: (page) => {
      set({ currentPage: page });
    },

    setCollaborativeCallback: (callback) => {
      set({ collaborativeCallback: callback });
    },
  };
});
