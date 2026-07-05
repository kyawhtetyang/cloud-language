export const INTERACTIVE_SIZE = {
  touchTarget: 'h-11 w-11',
  touchTargetLarge: 'h-12 w-12',
  mobileNavButtonHeight: 'h-14',
} as const;

export const BUTTON_UI = {
  iconNavButton:
    `portfolio-soft-icon-button inline-flex ${INTERACTIVE_SIZE.touchTarget} items-center justify-center rounded-full text-[var(--portfolio-text-secondary)] transition-colors`,
  iconNavGlyph: 'text-lg font-black leading-none',
  footerRoundBase:
    'flex items-center justify-center rounded-full border transition-all duration-300 ease-out',
  footerRoundSmall: INTERACTIVE_SIZE.touchTarget,
  footerRoundLarge: INTERACTIVE_SIZE.touchTargetLarge,
  footerFlatBase:
    'inline-flex items-center justify-center rounded-full border border-transparent text-[var(--portfolio-text-secondary)] transition-all duration-300 ease-out',
  footerFlatSmall:
    'h-11 w-11 min-w-0 rounded-none border-none bg-transparent px-0 shadow-none',
  footerSelected: 'border-transparent bg-[var(--portfolio-accent)] text-white shadow-[0_14px_28px_-18px_var(--portfolio-accent)]',
  footerUnselected: 'border-[color:color-mix(in_srgb,var(--portfolio-border-strong)_85%,transparent)] bg-[color:color-mix(in_srgb,var(--portfolio-surface)_92%,transparent)] text-[var(--portfolio-text-secondary)] shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)]',
  footerDisabledSmall: 'border-[var(--portfolio-border-soft)] bg-[color:color-mix(in_srgb,var(--portfolio-surface-muted)_88%,transparent)] text-[var(--portfolio-text-muted)] cursor-not-allowed opacity-50',
  footerDisabledLarge: 'border-[var(--portfolio-border-soft)] bg-[color:color-mix(in_srgb,var(--portfolio-surface-muted)_88%,transparent)] text-[var(--portfolio-text-muted)] cursor-not-allowed opacity-65',
  footerInteractiveSmall: 'border-[color:color-mix(in_srgb,var(--portfolio-border-strong)_85%,transparent)] bg-[color:color-mix(in_srgb,var(--portfolio-surface)_92%,transparent)] text-[var(--portfolio-text-secondary)] shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)] hover:border-[var(--portfolio-border-strong)] hover:bg-[var(--portfolio-surface-hover)] hover:text-[var(--portfolio-text)] active:scale-[0.97]',
  footerInteractiveFlat: 'text-[var(--portfolio-text-secondary)] hover:text-[var(--portfolio-text)] hover:scale-[1.06] active:scale-[0.98]',
  footerSelectedFlat: 'text-[var(--portfolio-accent)] hover:text-[var(--portfolio-accent)] hover:scale-[1.04]',
  footerDisabledFlat: 'text-[var(--portfolio-text-muted)] opacity-40',
  footerInteractiveLarge: 'border-transparent bg-[linear-gradient(135deg,var(--portfolio-accent),color-mix(in_srgb,var(--portfolio-accent)_80%,white))] text-white shadow-[0_22px_38px_-24px_var(--portfolio-accent)] hover:brightness-[1.03] hover:scale-[1.02] active:scale-[0.98]',
  footerInteractiveLargeFlat:
    'h-11 min-w-[3rem] rounded-xl border border-[var(--portfolio-border-strong)] bg-[color:color-mix(in_srgb,var(--portfolio-surface)_92%,transparent)] px-3 text-[var(--portfolio-text)] shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)] hover:border-[var(--portfolio-border-strong)] hover:bg-[var(--portfolio-surface-hover)] hover:scale-[1.02] active:scale-[0.98]',
  footerDisabledLargeFlat:
    'h-11 min-w-[3rem] rounded-xl border border-[var(--portfolio-border-soft)] bg-[color:color-mix(in_srgb,var(--portfolio-surface-muted)_88%,transparent)] px-3 text-[var(--portfolio-text-muted)] cursor-not-allowed opacity-60',
  actionBase: 'border font-extrabold uppercase tracking-wide transition-all',
  actionShapeDefault: 'rounded-xl',
  actionShapeLarge: 'rounded-2xl',
  actionSizeSm: 'px-3 py-2 text-xs',
  actionSizeMd: 'px-4 py-3 text-sm',
  actionSizeLg: 'py-4 text-lg tracking-wider',
  actionPrimary: 'border-transparent bg-[var(--portfolio-accent)] text-white shadow-[var(--portfolio-shadow-sm)]',
  actionSecondary: 'border-[var(--portfolio-border-strong)] bg-[var(--portfolio-surface)] text-[var(--portfolio-text-secondary)] shadow-[var(--portfolio-shadow-sm)] hover:bg-[var(--portfolio-surface-hover)]',
  actionDisabled:
    'border-[var(--portfolio-border-soft)] bg-[var(--portfolio-surface-muted)] text-[var(--portfolio-text-muted)] cursor-not-allowed',
  actionFullWidth: 'w-full',
  sidebarNavBase:
    'w-full rounded-xl border text-sm font-extrabold uppercase tracking-wide transition-all',
  sidebarNavCompactPadding: 'px-3 py-2.5',
  sidebarNavProfilePadding: 'px-3 py-3',
  sidebarNavActive: 'border-[var(--portfolio-border-strong)] bg-[color:color-mix(in_srgb,var(--portfolio-text)_6%,transparent)] text-[var(--portfolio-accent)] shadow-[var(--portfolio-shadow-sm)]',
  sidebarNavInactive: 'border-[var(--portfolio-border-strong)] bg-[var(--portfolio-surface)] text-[var(--portfolio-text-secondary)] shadow-[var(--portfolio-shadow-sm)] hover:bg-[var(--portfolio-surface-hover)]',
  sidebarBrandIcon: 'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-[var(--portfolio-accent)] text-white shadow-[var(--portfolio-shadow-sm)]',
  sidebarCloseButton: 'md:hidden text-[var(--portfolio-text-secondary)] font-bold text-xl',
  dialogDismissOverlay: 'absolute inset-0 bg-black/40',
  sidebarDismissOverlay: 'fixed inset-0 bg-black/30 z-30 md:hidden',
  iconCircleButtonBase:
    `inline-flex ${INTERACTIVE_SIZE.touchTarget} items-center justify-center rounded-full border transition-colors`,
  iconCircleButtonDefault:
    'border-[var(--portfolio-border-soft)] bg-[var(--portfolio-surface)] text-[var(--portfolio-text-secondary)] shadow-[var(--portfolio-shadow-sm)] hover:bg-[var(--portfolio-surface-hover)]',
  iconCircleButtonActive:
    'border-transparent bg-[var(--portfolio-accent)] text-white shadow-[var(--portfolio-shadow-sm)]',
  iconCircleButtonLoading:
    'border-[var(--portfolio-border-soft)] bg-[var(--portfolio-surface-muted)] text-[var(--portfolio-text-muted)] cursor-wait',
  mobileNavButtonBase: `${INTERACTIVE_SIZE.mobileNavButtonHeight} flex flex-col items-center justify-center gap-1 rounded-xl transition-all`,
  mobileNavButtonActive: 'bg-transparent text-[var(--portfolio-accent)]',
  mobileNavButtonInactive: 'bg-transparent text-[var(--portfolio-text-secondary)]',
  mobileNavIconWrapBase: 'flex items-center justify-center transition-all',
  mobileNavIconWrapActive: 'bg-transparent text-[var(--portfolio-accent)] shadow-none',
  mobileNavIconWrapInactive: 'bg-transparent text-[var(--portfolio-text-secondary)]',
  mobileNavLabelBase: 'text-xs font-bold leading-none',
  mobileNavLabelActive: 'text-[var(--portfolio-accent)]',
  mobileNavLabelInactive: 'text-[var(--portfolio-text-secondary)]',
  bottomBarCardBase:
    'w-full rounded-[1.35rem] border border-[var(--portfolio-border-strong)] backdrop-blur-md',
  bottomBarCardSolid:
    'bg-[var(--portfolio-surface)] shadow-[0_20px_48px_-30px_rgba(15,23,42,0.45)]',
  bottomBarCardFrosted:
    'bg-[color:color-mix(in_srgb,var(--portfolio-surface)_84%,transparent)] shadow-[0_24px_54px_-34px_rgba(15,23,42,0.5)]',
  bottomBarCardInteractive:
    'transition-transform duration-300 md:hover:translate-y-[-1px]',
  bottomBarMobileAnchor:
    'bottom-[calc(64px+env(safe-area-inset-bottom))]',
  bottomBarDesktopAnchor:
    'md:bottom-4 md:left-20 lg:left-64 md:right-0 md:w-auto md:max-w-none md:translate-x-0 md:px-6 md:pb-0',
  bottomBarContentFrame: 'mx-auto w-full max-w-3xl',
  bottomBarLessonDesktopFrame:
    'md:mx-auto md:w-full md:max-w-[30rem]',
  pillButtonBase: 'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
  pillButtonDefault:
    'border-[var(--portfolio-border-soft)] bg-[var(--portfolio-surface)] text-[var(--portfolio-text-secondary)]',
  pillButtonMuted:
    'border-[var(--portfolio-border-soft)] bg-[var(--portfolio-surface)] text-[var(--portfolio-text-muted)]',
  pillButtonSelected: 'border-transparent bg-[var(--portfolio-accent)] text-white shadow-[var(--portfolio-shadow-sm)]',
} as const;

type FooterSmallButtonOptions = {
  isSelected?: boolean;
  isDisabled?: boolean;
  isInteractive?: boolean;
  flatDesktop?: boolean;
};

export function getFooterSmallButtonClass({
  isSelected = false,
  isDisabled = false,
  isInteractive = false,
  flatDesktop = false,
}: FooterSmallButtonOptions): string {
  if (flatDesktop) {
    const flatToneClass = isDisabled
      ? BUTTON_UI.footerDisabledFlat
      : isSelected
        ? BUTTON_UI.footerSelectedFlat
        : BUTTON_UI.footerInteractiveFlat;
    return `${BUTTON_UI.footerFlatBase} ${BUTTON_UI.footerFlatSmall} ${flatToneClass}`;
  }
  if (isDisabled) {
    return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundSmall} ${BUTTON_UI.footerDisabledSmall}`;
  }
  if (isSelected) {
    return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundSmall} ${BUTTON_UI.footerSelected}`;
  }
  if (isInteractive) {
    return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundSmall} ${BUTTON_UI.footerInteractiveSmall}`;
  }
  return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundSmall} ${BUTTON_UI.footerUnselected}`;
}

export function getFooterLargeButtonClass(isDisabled: boolean, flat = false): string {
  if (flat) {
    return `inline-flex items-center justify-center transition-all duration-300 ease-out ${
      isDisabled ? BUTTON_UI.footerDisabledLargeFlat : BUTTON_UI.footerInteractiveLargeFlat
    }`;
  }
  return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundLarge} ${
    isDisabled ? BUTTON_UI.footerDisabledLarge : BUTTON_UI.footerInteractiveLarge
  }`;
}

type ActionButtonOptions = {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'default' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
};

export function getActionButtonClass({
  variant = 'secondary',
  size = 'sm',
  shape = 'default',
  fullWidth = false,
  disabled = false,
}: ActionButtonOptions = {}): string {
  const shapeClass = shape === 'large' ? BUTTON_UI.actionShapeLarge : BUTTON_UI.actionShapeDefault;
  const sizeClass = size === 'lg' ? BUTTON_UI.actionSizeLg : size === 'md' ? BUTTON_UI.actionSizeMd : BUTTON_UI.actionSizeSm;
  const widthClass = fullWidth ? BUTTON_UI.actionFullWidth : '';
  const toneClass = disabled
    ? BUTTON_UI.actionDisabled
    : variant === 'primary'
      ? BUTTON_UI.actionPrimary
      : BUTTON_UI.actionSecondary;
  return `${shapeClass} ${BUTTON_UI.actionBase} ${sizeClass} ${toneClass} ${widthClass}`.trim();
}

export function getSidebarNavButtonClass(active: boolean, profile = false): string {
  return `${BUTTON_UI.sidebarNavBase} ${
    profile ? BUTTON_UI.sidebarNavProfilePadding : BUTTON_UI.sidebarNavCompactPadding
  } ${active ? BUTTON_UI.sidebarNavActive : BUTTON_UI.sidebarNavInactive}`;
}

export function getIconCircleButtonClass(state: 'default' | 'active' | 'loading'): string {
  const toneClass = state === 'loading'
    ? BUTTON_UI.iconCircleButtonLoading
    : state === 'active'
      ? BUTTON_UI.iconCircleButtonActive
      : BUTTON_UI.iconCircleButtonDefault;
  return `${BUTTON_UI.iconCircleButtonBase} ${toneClass}`;
}

export function getMobileNavButtonClass(isActive: boolean): string {
  return `${BUTTON_UI.mobileNavButtonBase} ${
    isActive ? BUTTON_UI.mobileNavButtonActive : BUTTON_UI.mobileNavButtonInactive
  }`;
}

export function getMobileNavIconWrapClass(isActive: boolean): string {
  return `${BUTTON_UI.mobileNavIconWrapBase} ${
    isActive ? BUTTON_UI.mobileNavIconWrapActive : BUTTON_UI.mobileNavIconWrapInactive
  }`;
}

export function getMobileNavLabelClass(isActive: boolean): string {
  return `${BUTTON_UI.mobileNavLabelBase} ${
    isActive ? BUTTON_UI.mobileNavLabelActive : BUTTON_UI.mobileNavLabelInactive
  }`;
}

type BottomBarCardOptions = {
  variant?: 'solid' | 'frosted';
  interactive?: boolean;
};

export function getBottomBarCardClass({
  variant = 'solid',
  interactive = false,
}: BottomBarCardOptions = {}): string {
  const variantClass = variant === 'frosted'
    ? BUTTON_UI.bottomBarCardFrosted
    : BUTTON_UI.bottomBarCardSolid;
  return `${BUTTON_UI.bottomBarCardBase} ${variantClass} ${interactive ? BUTTON_UI.bottomBarCardInteractive : ''}`.trim();
}

export function getPillButtonClass(state: 'default' | 'muted' | 'selected'): string {
  const toneClass = state === 'selected'
    ? BUTTON_UI.pillButtonSelected
    : state === 'muted'
      ? BUTTON_UI.pillButtonMuted
      : BUTTON_UI.pillButtonDefault;
  return `${BUTTON_UI.pillButtonBase} ${toneClass}`;
}

