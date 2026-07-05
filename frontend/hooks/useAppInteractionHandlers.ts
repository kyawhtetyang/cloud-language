import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  CourseFramework,
  DEFAULT_LIBRARY_VIEW_MODE,
  LearnLanguage,
  LibraryViewMode,
  SidebarTab,
  VoiceProvider,
} from '../config/appConfig';
import { buildUnitBookmarkKey } from '../config/bookmarkKeys';

type UseAppInteractionHandlersArgs = {
  lastLibraryTabTapAtRef: MutableRefObject<number>;
  sidebarTab: SidebarTab;
  isReading: boolean;
  activeSpeakingLessonIndex: number | null;
  setLibraryViewMode: Dispatch<SetStateAction<LibraryViewMode>>;
  setLibrarySelectedAlbumKey: Dispatch<SetStateAction<string | null>>;
  setSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setBookmarkedUnitKeys: Dispatch<SetStateAction<Set<string>>>;
  setBookmarkedAlbumKeys: Dispatch<SetStateAction<Set<string>>>;
  setTrackPlaybackEnabled: (enabled: boolean) => void;
  resetUnitPlaybackAnchor: () => void;
  stopActivePlayback: () => Promise<void>;
  selectTab: (tab: SidebarTab) => void;
  learnLanguage: LearnLanguage;
  setLearnLanguage: Dispatch<SetStateAction<LearnLanguage>>;
  voiceProvider: VoiceProvider;
  setVoiceProvider: Dispatch<SetStateAction<VoiceProvider>>;
  courseFramework: CourseFramework;
  setCourseFramework: Dispatch<SetStateAction<CourseFramework>>;
  handleReadCurrentBatch: () => Promise<void>;
};

type UseAppInteractionHandlersResult = {
  handleMobileTabChange: (tab: SidebarTab) => void;
  handleOpenProfileAlbumLibrary: () => void;
  handleToggleUnitBookmark: (level: number, unit: number, albumKey?: string | null) => void;
  handleToggleAlbumBookmark: (albumKey: string) => void;
  handleLearnLanguageChangeWithStop: (value: LearnLanguage) => void;
  handleVoiceProviderChangeWithStop: (value: VoiceProvider) => void;
  handleCourseFrameworkChangeWithStop: (value: CourseFramework) => void;
  handleReadForActiveTab: () => Promise<void>;
};

export function useAppInteractionHandlers({
  lastLibraryTabTapAtRef,
  sidebarTab,
  isReading,
  activeSpeakingLessonIndex,
  setLibraryViewMode,
  setLibrarySelectedAlbumKey,
  setSidebarTab,
  setIsSidebarOpen,
  setBookmarkedUnitKeys,
  setBookmarkedAlbumKeys,
  setTrackPlaybackEnabled,
  resetUnitPlaybackAnchor,
  stopActivePlayback,
  selectTab,
  learnLanguage,
  setLearnLanguage,
  voiceProvider,
  setVoiceProvider,
  courseFramework,
  setCourseFramework,
  handleReadCurrentBatch,
}: UseAppInteractionHandlersArgs): UseAppInteractionHandlersResult {
  const stopPlaybackForVoiceSettingChange = () => {
    setTrackPlaybackEnabled(false);
    resetUnitPlaybackAnchor();
    if (isReading || activeSpeakingLessonIndex !== null) {
      void stopActivePlayback();
    }
  };

  const handleMobileTabChange = (tab: SidebarTab) => {
    if (tab === 'library' && sidebarTab === 'library') {
      const now = Date.now();
      const isDoubleTap = (now - lastLibraryTabTapAtRef.current) <= 450;
      lastLibraryTabTapAtRef.current = now;
      if (isDoubleTap) {
        setLibraryViewMode(DEFAULT_LIBRARY_VIEW_MODE);
        setLibrarySelectedAlbumKey(null);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }
    lastLibraryTabTapAtRef.current = 0;
    if (tab === 'library') {
      setLibraryViewMode(DEFAULT_LIBRARY_VIEW_MODE);
    }
    selectTab(tab);
  };

  const handleOpenProfileAlbumLibrary = () => {
    setLibraryViewMode(DEFAULT_LIBRARY_VIEW_MODE);
    setLibrarySelectedAlbumKey(null);
    setSidebarTab('library');
    setIsSidebarOpen(false);
  };

  const handleToggleUnitBookmark = (level: number, unit: number, albumKey?: string | null) => {
    const unitKey = buildUnitBookmarkKey(level, unit, albumKey);
    setBookmarkedUnitKeys((previous) => {
      const next = new Set(previous);
      if (next.has(unitKey)) {
        next.delete(unitKey);
      } else {
        next.add(unitKey);
      }
      return next;
    });
  };

  const handleToggleAlbumBookmark = (albumKey: string) => {
    if (!albumKey) return;
    setBookmarkedAlbumKeys((previous) => {
      const next = new Set(previous);
      if (next.has(albumKey)) {
        next.delete(albumKey);
      } else {
        next.add(albumKey);
      }
      return next;
    });
  };

  const handleLearnLanguageChangeWithStop = (value: LearnLanguage) => {
    if (value === learnLanguage) return;
    stopPlaybackForVoiceSettingChange();
    setLearnLanguage(value);
  };

  const handleVoiceProviderChangeWithStop = (value: VoiceProvider) => {
    if (value === voiceProvider) return;
    stopPlaybackForVoiceSettingChange();
    setVoiceProvider(value);
  };

  const handleCourseFrameworkChangeWithStop = (value: CourseFramework) => {
    if (value === courseFramework) return;
    stopPlaybackForVoiceSettingChange();
    setCourseFramework(value);
  };

  const handleReadForActiveTab = async () => {
    await handleReadCurrentBatch();
  };

  return {
    handleMobileTabChange,
    handleOpenProfileAlbumLibrary,
    handleToggleUnitBookmark,
    handleToggleAlbumBookmark,
    handleLearnLanguageChangeWithStop,
    handleVoiceProviderChangeWithStop,
    handleCourseFrameworkChangeWithStop,
    handleReadForActiveTab,
  };
}

