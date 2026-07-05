import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLessonOrderIndex, getLessonUnitId } from '../config/appConfig';
import { LessonData } from '../types';
import { readDownloadedUnitKeys, removeLessonPack, saveLessonPack } from '../offline/offlineStore';

type UseOfflineLessonPacksResult = {
  downloadedUnitKeys: Set<string>;
  downloadUnitPack: (level: number, unit: number) => Promise<void>;
  removeUnitPack: (level: number, unit: number) => Promise<void>;
  isUnitDownloading: (level: number, unit: number) => boolean;
};

function unitKey(level: number, unit: number): string {
  return `${level}:${unit}`;
}

export function useOfflineLessonPacks(
  lessonLanguage: string,
  lessons: LessonData[],
): UseOfflineLessonPacksResult {
  const [downloadedUnitKeys, setDownloadedUnitKeys] = useState<Set<string>>(new Set());
  const [activeDownloads, setActiveDownloads] = useState<Set<string>>(new Set());

  const refreshDownloadedState = useCallback(async () => {
    const keys = await readDownloadedUnitKeys(lessonLanguage);
    setDownloadedUnitKeys(keys);
  }, [lessonLanguage]);

  useEffect(() => {
    void refreshDownloadedState();
  }, [refreshDownloadedState]);

  const lessonsByUnit = useMemo(() => {
    const map = new Map<string, LessonData[]>();
    for (const lesson of lessons) {
      const key = unitKey(getLessonOrderIndex(lesson), getLessonUnitId(lesson));
      const arr = map.get(key);
      if (arr) arr.push(lesson);
      else map.set(key, [lesson]);
    }
    return map;
  }, [lessons]);

  const downloadUnitPack = useCallback(
    async (level: number, unit: number) => {
      const key = unitKey(level, unit);
      const unitLessons = lessonsByUnit.get(key) || [];
      if (unitLessons.length === 0) return;

      setActiveDownloads((prev) => new Set(prev).add(key));
      try {
        await saveLessonPack(lessonLanguage, level, unit, unitLessons, 'v1');
        setDownloadedUnitKeys((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      } finally {
        setActiveDownloads((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [lessonLanguage, lessonsByUnit],
  );

  const removeUnitPack = useCallback(
    async (level: number, unit: number) => {
      const key = unitKey(level, unit);
      setActiveDownloads((prev) => new Set(prev).add(key));
      try {
        await removeLessonPack(lessonLanguage, level, unit);
        setDownloadedUnitKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } finally {
        setActiveDownloads((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [lessonLanguage],
  );

  const isUnitDownloading = useCallback(
    (level: number, unit: number) => activeDownloads.has(unitKey(level, unit)),
    [activeDownloads],
  );

  return { downloadedUnitKeys, downloadUnitPack, removeUnitPack, isUnitDownloading };
}



