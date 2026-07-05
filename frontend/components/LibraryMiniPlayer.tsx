import React from 'react';
import {
  BUTTON_UI,
  getBottomBarCardClass,
  getFooterLargeButtonClass,
  getFooterSmallButtonClass,
} from '../config/buttonUi';
import { AppTextPack } from '../config/appI18n';

type LibraryMiniPlayerProps = {
  lessonText: AppTextPack['lesson'];
  trackTitle: string;
  trackMeta: string;
  isPlaying: boolean;
  isVisible?: boolean;
  isPreviousDisabled: boolean;
  isPlayDisabled: boolean;
  isNextDisabled: boolean;
  onPrevious: () => void;
  onPlay: () => void;
  onNext: () => void;
  onOpenPlayer: () => void;
};

const PreviousIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-7 w-7" aria-hidden="true">
    <rect x="5" y="6" width="2" height="12" rx="1" fill="currentColor" />
    <path d="M16 7l-7 5 7 5V7Z" fill="currentColor" />
  </svg>
);

const NextIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-7 w-7" aria-hidden="true">
    <rect x="17" y="6" width="2" height="12" rx="1" fill="currentColor" />
    <path d="M8 7v10l7-5-7-5Z" fill="currentColor" />
  </svg>
);

const PlayIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6 translate-x-[1px]" aria-hidden="true">
    <path d="M9 7v10l8-5-8-5Z" fill="currentColor" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <rect x="8" y="7" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="13" y="7" width="3" height="10" rx="1" fill="currentColor" />
  </svg>
);

const TrackIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M15 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M11 14V6l6-1v7" />
  </svg>
);

export const LibraryMiniPlayer: React.FC<LibraryMiniPlayerProps> = ({
  lessonText,
  trackTitle,
  trackMeta,
  isPlaying,
  isVisible = true,
  isPreviousDisabled,
  isPlayDisabled,
  isNextDisabled,
  onPrevious,
  onPlay,
  onNext,
  onOpenPlayer,
}) => (
  <footer
    className={`fixed left-0 right-0 z-30 px-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] ${BUTTON_UI.bottomBarMobileAnchor} transition-all duration-300 ease-out ${BUTTON_UI.bottomBarDesktopAnchor} ${
      isVisible
        ? 'translate-y-0 opacity-100'
        : 'pointer-events-none translate-y-[160%] opacity-0 md:pointer-events-auto md:translate-y-0 md:opacity-100'
    }`}
  >
    <div className={BUTTON_UI.bottomBarContentFrame}>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenPlayer}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onOpenPlayer();
        }}
        className={`${getBottomBarCardClass({ variant: 'frosted', interactive: true })} group flex items-center gap-3 px-3 py-2.5`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--portfolio-border-strong)] bg-[color:color-mix(in_srgb,var(--portfolio-surface-muted)_88%,transparent)] text-[var(--portfolio-text-secondary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <TrackIcon />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--portfolio-text)]">
              {trackTitle}
            </p>
            <p className="truncate text-[11px] font-semibold tracking-[0.08em] text-[var(--portfolio-text-secondary)]">
              {trackMeta}
            </p>
          </div>
          {isPlaying && (
            <div className="hidden items-end gap-0.5 sm:flex" aria-hidden="true">
              {[0, 1, 2].map((bar) => (
                <span
                  key={`eq-${bar}`}
                  className="h-2 w-0.5 rounded-full bg-[var(--color-brand)] animate-pulse"
                  style={{ animationDelay: `${bar * 120}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
            disabled={isPreviousDisabled}
            aria-label={lessonText.previousLabel}
            title={lessonText.previousLabel}
            className={getFooterSmallButtonClass({
              isDisabled: isPreviousDisabled,
              isInteractive: true,
              flatDesktop: true,
            })}
          >
            <PreviousIcon />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
            onPlay();
            }}
            disabled={isPlayDisabled}
            aria-label={isPlaying ? lessonText.stopLabel : lessonText.readLabel}
            title={isPlaying ? lessonText.stopLabel : lessonText.readLabel}
            className={`${getFooterLargeButtonClass(isPlayDisabled)} ring-1 ring-white/10`}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            disabled={isNextDisabled}
            aria-label={lessonText.nextLabel}
            title={lessonText.nextLabel}
            className={getFooterSmallButtonClass({
              isDisabled: isNextDisabled,
              isInteractive: true,
              flatDesktop: true,
            })}
          >
            <NextIcon />
          </button>
        </div>
      </div>
    </div>
  </footer>
);

