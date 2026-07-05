import React from 'react';

type TrackActionSheetProps = {
  isOpen: boolean;
  closeAriaLabel: string;
  trackTitle: string;
  trackUnitCode: string;
  openLessonLabel: string;
  bookmarkTrackLabel: string;
  onClose: () => void;
  onOpenLesson: () => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
  desktopMode?: 'sheet' | 'popover';
  anchorRect?: DOMRect | null;
};

export const TrackActionSheet: React.FC<TrackActionSheetProps> = ({
  isOpen,
  closeAriaLabel,
  trackTitle,
  trackUnitCode,
  openLessonLabel,
  bookmarkTrackLabel,
  onClose,
  onOpenLesson,
  onToggleBookmark,
  isBookmarked,
  desktopMode = 'sheet',
  anchorRect = null,
}) => {
  if (!isOpen) return null;

  const supportsDesktopPopover = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches;
  const isDesktopPopover = desktopMode === 'popover' && supportsDesktopPopover;
  const desktopWidth = 300;
  const desktopHeightEstimate = 320;
  const desktopViewportPadding = 12;
  const desktopAnchorGap = 8;

  const desktopPopoverStyle = React.useMemo((): React.CSSProperties | undefined => {
    if (!isDesktopPopover || !anchorRect || typeof window === 'undefined') return undefined;

    const maxLeft = window.innerWidth - desktopWidth - desktopViewportPadding;
    const left = Math.min(
      maxLeft,
      Math.max(desktopViewportPadding, anchorRect.right - desktopWidth),
    );

    const belowTop = anchorRect.bottom + desktopAnchorGap;
    const canPlaceBelow = belowTop + desktopHeightEstimate <= window.innerHeight - desktopViewportPadding;
    const top = canPlaceBelow
      ? belowTop
      : Math.max(desktopViewportPadding, anchorRect.top - desktopHeightEstimate - desktopAnchorGap);

    return { width: desktopWidth, left, top };
  }, [anchorRect, isDesktopPopover]);

  return (
    <div className="fixed inset-0 z-50 md:z-[60]">
      <button
        type="button"
        aria-label={closeAriaLabel}
        className={`absolute inset-0 ${isDesktopPopover ? 'bg-black/55 md:bg-transparent' : 'bg-black/55'}`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-[var(--border-subtle)] bg-[var(--surface-default)] px-4 pb-6 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.28)] ${
          isDesktopPopover
            ? 'md:inset-auto md:bottom-auto md:rounded-2xl md:border md:px-3 md:pb-3 md:pt-2 md:shadow-[0_14px_30px_rgba(0,0,0,0.28)]'
            : ''
        }`}
        style={desktopPopoverStyle}
      >
        <div className={`mx-auto mb-3 h-1 w-11 rounded-full bg-[var(--border-subtle)] ${isDesktopPopover ? 'md:hidden' : ''}`} />
        <div className="mb-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-2">
          <p className="truncate text-base font-semibold text-[var(--portfolio-text)]">{trackTitle}</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--text-muted)]">{trackUnitCode}</p>
        </div>
        <div className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
          <button
            type="button"
            onClick={onOpenLesson}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-[var(--portfolio-text)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span>{openLessonLabel}</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onToggleBookmark}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-[var(--portfolio-text)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span>{bookmarkTrackLabel}</span>
            {isBookmarked ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M6 3h12v18l-6-4-6 4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h12v18l-6-4-6 4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

