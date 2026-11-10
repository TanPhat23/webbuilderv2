import { Page } from "@/features/pages";
import { deleteProject } from "@/features/projects/api/project.api";
import { create } from "zustand";

/**
 * Type definition for the Zustand PageStore.
 */
type PageStore = {
  // State
  pages: Page[];

  currentPage: Page | null;

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
   * Load a set of pages into the store.
   * @param pages The array of Page objects to load.
   */
  loadPages: (pages: Page[]) => void;

  setCurrentPage: (page: Page | null) => void;
};

export const usePageStore = create<PageStore>((set, get) => {
  return {
    pages: [], // initial state
    currentPage: null,

    updatePage: (updates, id) => {
      set((state) => ({
        pages: state.pages.map((page) =>
          page.Id === id ? { ...page, ...updates } : page,
        ),
      }));
      // TODO: Optionally, call an API to persist the update
    },
    addPage: (newPage) => {
      set((state) => ({
        pages: [...state.pages, newPage],
      }));
    },

    deletePage: async (id) => {
      const pagesCopy = get().pages;
      const pageToDelete = pagesCopy.find((page) => page.Id === id);
      set((state) => ({
        pages: state.pages.filter((page) => page.Id !== id),
      }));
      if (pageToDelete) {
        const result = await deleteProject({
          data: { projectId: pageToDelete.ProjectId },
        });
        if (!result?.success) {
          set({ pages: pagesCopy });
        }
      }
    },

    loadPages: (pages) => {
      set({ pages });
      // TODO: Optionally, call an API to fetch pages if needed
    },

    setCurrentPage: (page) => {
      set({ currentPage: page });
    },
  };
});
