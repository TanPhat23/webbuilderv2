import { Page } from "@/features/pages";
import { deleteProjectPage } from "@/features/projects/api/page.api";
import { showErrorToast } from "@/utils/errors/errorToast";
import { deletePageFromList, pageAfterDeletion } from "./delete-page";
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

  deletePage: (id: string) => Promise<boolean>;
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
      try {
        const originalPages = get().pages;
        const pages = await deletePageFromList(originalPages, id, async (projectId, pageId) => {
          await deleteProjectPage({ data: { projectId, pageId } });
        });
        if (pages !== originalPages) {
          set((state) => {
            const remaining = state.pages.filter((page) => page.Id !== id);
            return { pages: remaining, currentPage: pageAfterDeletion(state.currentPage, id, remaining) };
          });
          return true;
        }
        return false;
      } catch {
        showErrorToast("Failed to delete page");
        return false;
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
