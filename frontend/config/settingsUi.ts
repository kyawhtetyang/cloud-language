import { BUTTON_UI, INTERACTIVE_SIZE } from './buttonUi';

const SETTINGS_ROW_HEIGHT_CLASS = 'h-14';

export const SETTINGS_UI = {
  sectionTitle: 'text-base font-medium text-[var(--portfolio-text)]',
  listCard:
    'overflow-hidden rounded-xl border border-[var(--portfolio-border-soft)] bg-[var(--portfolio-surface)] shadow-[var(--portfolio-shadow-sm)]',
  listDivider: 'border-t border-[var(--portfolio-border-soft)]',
  rowHeight: SETTINGS_ROW_HEIGHT_CLASS,
  listRow: `portfolio-selectable-row w-full ${SETTINGS_ROW_HEIGHT_CLASS} flex items-center justify-between gap-3 rounded-xl px-4 text-left transition-colors`,
  staticRow: `${SETTINGS_ROW_HEIGHT_CLASS} flex items-center px-4`,
  rowValue: 'flex items-center gap-2 text-sm font-normal text-[var(--portfolio-text-secondary)]',
  optionLabel: 'text-base font-medium text-[var(--portfolio-text)]',
  rightControlSlot: 'flex items-center justify-end',
  toggleControlSlot: 'flex min-w-16 items-center justify-end',
  textSizeRow: 'w-full flex items-center justify-between gap-4',
  textSizeControlSlot: 'ml-auto flex items-center justify-end',
  textSizeControlGroup: 'flex items-center gap-2',
  textSizeButtonBase: `${INTERACTIVE_SIZE.touchTarget} rounded-lg border text-base font-extrabold transition-all`,
  textSizeButtonDisabled:
    'border-[var(--portfolio-border-soft)] bg-[var(--portfolio-surface-muted)] text-[var(--portfolio-text-muted)] cursor-not-allowed',
  textSizeValue: 'min-w-12 text-center text-xs font-normal text-[var(--portfolio-text-secondary)]',
  toggleBadgeBase:
    'inline-flex min-w-16 items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-all',
  toggleBadgeOn: 'portfolio-chip-active border-transparent',
  toggleBadgeOff: 'portfolio-chip-idle text-[var(--portfolio-text-secondary)]',
  subPageHeader: 'mb-4 flex items-center gap-3',
  subPageBackButton: `${BUTTON_UI.iconNavButton} ${BUTTON_UI.iconNavGlyph}`,
  subPageTitle: 'text-lg font-normal text-[var(--portfolio-text)]',
} as const;

export const SETTINGS_UI_TEXT = {
  on: 'On',
  off: 'Off',
} as const;

export function getSettingsToggleBadgeClass(isOn: boolean): string {
  return `${SETTINGS_UI.toggleBadgeBase} ${isOn ? SETTINGS_UI.toggleBadgeOn : SETTINGS_UI.toggleBadgeOff}`;
}

export function getSettingsTextSizeButtonClass(isEnabled: boolean): string {
  return `${SETTINGS_UI.textSizeButtonBase} ${
    isEnabled
      ? 'border-[var(--portfolio-border-strong)] bg-[var(--portfolio-surface)] text-[var(--portfolio-text-secondary)] hover:bg-[var(--portfolio-surface-hover)]'
      : SETTINGS_UI.textSizeButtonDisabled
  }`;
}

