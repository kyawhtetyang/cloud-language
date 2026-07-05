import React from 'react';
import { LessonActionFooter } from '../LessonActionFooter';
import { MobileBottomNav } from '../MobileBottomNav';
import { LibraryMiniPlayer } from '../LibraryMiniPlayer';

type AppBottomBarsProps = {
  showLessonActions: boolean;
  showLibraryMiniPlayer: boolean;
  lessonActionFooterProps: React.ComponentProps<typeof LessonActionFooter>;
  libraryMiniPlayerProps: React.ComponentProps<typeof LibraryMiniPlayer>;
  mobileBottomNavProps: React.ComponentProps<typeof MobileBottomNav>;
};

export const AppBottomBars: React.FC<AppBottomBarsProps> = ({
  showLessonActions,
  showLibraryMiniPlayer,
  lessonActionFooterProps,
  libraryMiniPlayerProps,
  mobileBottomNavProps,
}) => (
  <>
    {showLessonActions && <LessonActionFooter {...lessonActionFooterProps} />}
    {showLibraryMiniPlayer && <LibraryMiniPlayer {...libraryMiniPlayerProps} />}
    <MobileBottomNav {...mobileBottomNavProps} />
  </>
);

