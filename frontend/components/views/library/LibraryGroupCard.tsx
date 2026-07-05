import React from 'react';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';

type LibraryGroupCardProps = {
  title: string;
  meta: string;
  coverUrl: string;
  accentClass: string;
  ariaLabel: string;
  onOpen: () => void;
};

export const LibraryGroupCard: React.FC<LibraryGroupCardProps> = ({
  title,
  meta,
  coverUrl,
  accentClass,
  ariaLabel,
  onOpen,
}) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={ariaLabel}
    className={LIBRARY_UI_TOKENS.groupCardButton}
  >
    <div className="grid grid-cols-[48px,1fr,20px] items-center gap-3">
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
        <div className="absolute inset-y-0 left-0 z-10 w-1 bg-black/12" aria-hidden="true" />
        <img
          src={coverUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold leading-tight text-[var(--portfolio-text)]">{title}</p>
        <p className="mt-1 truncate text-xs font-semibold text-[var(--text-muted)]">{meta}</p>
      </div>
      <span
        className={`flex h-5 w-5 items-center justify-center ${accentClass || LIBRARY_UI_TOKENS.sectionAccent}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </div>
  </button>
);

