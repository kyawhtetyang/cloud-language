import React from 'react';
import { AppMode } from '../../config/appConfig';
import { LibraryView } from '../views/LibraryView';
import { LessonView } from '../views/LessonView';
import { ProfileView } from '../views/ProfileView';
import { SettingsView } from '../views/SettingsView';
import { CompletedView } from '../views/AppStateViews';
import { AppTextPack } from '../../config/appI18n';

type AppMainContentProps = {
  isProfileView: boolean;
  isLibraryView: boolean;
  isLessonView: boolean;
  isSettingsView: boolean;
  mode: AppMode;
  profileViewProps: React.ComponentProps<typeof ProfileView>;
  libraryViewProps: React.ComponentProps<typeof LibraryView>;
  settingsViewProps: React.ComponentProps<typeof SettingsView>;
  lessonViewProps: React.ComponentProps<typeof LessonView>;
  appStateText: AppTextPack['appState'];
  onCompletedRestart: () => void;
};

export const AppMainContent: React.FC<AppMainContentProps> = ({
  isProfileView,
  isLibraryView,
  isLessonView,
  isSettingsView,
  mode,
  profileViewProps,
  libraryViewProps,
  settingsViewProps,
  lessonViewProps,
  appStateText,
  onCompletedRestart,
}) => {
  const mainClass = isLibraryView || isLessonView || isProfileView || isSettingsView
    ? 'flex-1 min-h-0 px-4 pb-4 pt-0 md:px-6 md:pb-6 md:pt-0'
    : 'flex-1 min-h-0 flex items-start justify-center p-4 pt-6 md:p-6 md:pt-5';

  return (
    <main className={mainClass}>
      {isProfileView ? (
        <ProfileView {...profileViewProps} />
      ) : isLibraryView ? (
        <LibraryView {...libraryViewProps} />
      ) : isSettingsView ? (
        <SettingsView {...settingsViewProps} />
      ) : mode === 'completed' ? (
        <CompletedView onRestart={onCompletedRestart} appStateText={appStateText} />
      ) : (
        <LessonView {...lessonViewProps} />
      )}
    </main>
  );
};

