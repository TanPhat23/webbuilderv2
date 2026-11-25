import { useEffect, useRef, useState } from "react";

export interface CMSFetchState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

const parseItems = (body: unknown): unknown[] => (Array.isArray(body) ? body : []);
const NO_ITEMS: unknown[] = [];

interface CMSListQuery {
  contentTypeId?: string;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

/** Fetches the item list behind a preview CMS list/grid element. */
export function useCMSItemList({
  contentTypeId,
  limit,
  sortBy,
  sortOrder,
}: CMSListQuery): CMSFetchState<unknown[]> {
  return usePublicCMSQuery(
    contentTypeId
      ? `/api/cms/${contentTypeId}?limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      : null,
    parseItems,
    NO_ITEMS,
  );
}

/**
 * Fetches a CMS endpoint for the preview renderer.
 *
 * Nothing is fetched while `url` is null (e.g. no content type configured yet).
 * `parse` should be a stable (module-level) function; it turns the JSON body
 * into the shape the component renders.
 */
export function usePublicCMSQuery<T>(
  url: string | null,
  parse: (body: unknown) => T,
  initial: T,
): CMSFetchState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parseRef = useRef(parse);
  parseRef.current = parse;

  useEffect(() => {
    if (!url) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setData(parseRef.current(await response.json()));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  return { data, loading, error };
}
