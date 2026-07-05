import { useEffect, useState } from 'react';
import type { AlbumCollectionSection } from '../components/views/library/libraryTypes';
import { getGroupCoverUrl } from '../components/views/library/useLibraryCollections';

type UseLibraryIndexDataResult = {
  sections: AlbumCollectionSection[];
  loading: boolean;
  errorMessage: string | null;
};

export function useLibraryIndexData(
  apiBaseUrl: string,
  language: string,
  errorLabel: string,
  enabled = true,
): UseLibraryIndexDataResult {
  const [sections, setSections] = useState<AlbumCollectionSection[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const response = await fetch(
          `${apiBaseUrl}/api/library?language=${encodeURIComponent(language)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        const data = (await response.json()) as AlbumCollectionSection[];
        if (!isActive) return;
        const withCovers = (Array.isArray(data) ? data : []).map((section) => ({
          ...section,
          groups: (section.groups || []).map((group, groupIndex) => ({
            ...group,
            coverUrl: group.coverUrl || getGroupCoverUrl(groupIndex, group.firstTopicConcise || group.sourceLabel || 'General'),
          })),
        }));
        setSections(withCovers);
      } catch (error) {
        if (!isActive) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Failed to load library index', error);
        setErrorMessage(errorLabel);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [apiBaseUrl, enabled, errorLabel, language]);

  return { sections, loading, errorMessage };
}

