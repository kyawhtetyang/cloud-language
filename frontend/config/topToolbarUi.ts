export const TOP_TOOLBAR_UI = {
  wrapWithMargin: 'mb-3 w-full border-b border-[var(--border-subtle)] pb-2',
  dividerWithBottomPadding: 'border-b border-[var(--border-subtle)] pb-2',
  rowBase: 'top-toolbar-row flex items-center',
  rowBetween: 'top-toolbar-row flex items-center justify-between gap-2',
  rowBetweenWide: 'top-toolbar-row flex items-center justify-between gap-3',
  rowCenter: 'top-toolbar-row flex items-center justify-center gap-2',
  desktopFixedAnchor: 'md:fixed md:left-72 md:right-0 md:top-5 md:z-30 md:px-6',
  desktopFixedContent: 'md:mx-auto md:w-full md:max-w-3xl',
  desktopFixedSpacer: 'hidden md:block h-[calc(var(--top-toolbar-height)+0.5rem)]',
} as const;

