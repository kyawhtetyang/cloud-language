import { BUTTON_UI } from '../../../config/buttonUi';
import { TOP_TOOLBAR_UI } from '../../../config/topToolbarUi';

export const LIBRARY_UI_TOKENS = {
  searchWrap: TOP_TOOLBAR_UI.wrapWithMargin,
  searchRow: `${TOP_TOOLBAR_UI.rowBase} relative`,
  searchIcon:
    'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]',
  searchInput:
    'top-toolbar-control w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] pl-9 pr-3 text-base md:text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]',
  sectionWrap:
    'mb-4 last:mb-0',
  sectionHeaderBar: 'px-0 py-2 border-b border-[var(--border-subtle)]',
  sectionHeaderText:
    'text-xs font-extrabold uppercase tracking-[0.16em] md:text-xs text-[var(--text-secondary)]',
  sectionAccent: 'text-[var(--text-muted)]',
  iconButton: `${BUTTON_UI.iconCircleButtonBase} ${BUTTON_UI.iconCircleButtonDefault}`,
  groupCardButton: 'portfolio-selectable-row w-full min-h-[84px] px-0 py-3 text-left transition-colors',
  unitRowBase:
    'flex h-14 w-full items-center rounded-xl border border-transparent px-0 text-left transition-colors',
  unitRowActive: 'text-brand',
  unitRowActiveSurface:
    'portfolio-selectable-row-active',
  unitRowHoverSurface:
    'portfolio-selectable-row',
  unitOpenButton:
    'flex h-7 w-7 items-center justify-center justify-self-center rounded-full transition-colors hover:bg-[var(--surface-hover)]',
} as const;

export const LIBRARY_STATE_STYLE = {
  badgeDefault: 'text-[var(--text-secondary)]',
  badgeActive: 'text-brand',
  badgeCompleted: 'text-[var(--text-muted)]',
  downloadDefault:
    'border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]',
  downloadDone:
    'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-secondary)]',
  downloadLoading:
    'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-muted)] opacity-70 cursor-wait',
} as const;

