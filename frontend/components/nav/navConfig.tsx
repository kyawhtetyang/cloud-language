import React from 'react';
import { SidebarTab } from '../../config/appConfig';

export type NavIconProps = {
  className?: string;
  isActive?: boolean;
};

type NavTabMeta = {
  Icon: React.FC<NavIconProps>;
};

export const NAV_ICON_UI = {
  viewBox: '0 0 24 24',
  mobileSizeClass: 'h-[22px] w-[22px]',
  sidebarSizeClass: 'h-5 w-5 shrink-0',
  outerCircleRadius: 9,
  centerX: 12,
  centerY: 12,
} as const;

export const NAV_LAYOUT_UI = {
  mobileGridClass: 'grid gap-1 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1',
  sidebarItemContentClass: 'flex items-center gap-3',
  sidebarLabelClass: 'truncate',
} as const;

const LibraryIcon: React.FC<NavIconProps> = ({ className, isActive = false }) => (
  <svg
    viewBox={NAV_ICON_UI.viewBox}
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M3.8 10 12 3.8 20.2 10V20h-4.9v-4.8h-6.6V20H3.8z"
      fill={isActive ? 'currentColor' : 'none'}
      stroke="currentColor"
    />
  </svg>
);

const LessonIcon: React.FC<NavIconProps> = ({ className, isActive = false }) => (
  <svg
    viewBox={NAV_ICON_UI.viewBox}
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isActive && (
      <circle
        cx={NAV_ICON_UI.centerX}
        cy={NAV_ICON_UI.centerY}
        r={NAV_ICON_UI.outerCircleRadius}
        fill="currentColor"
        stroke="none"
      />
    )}
    <circle
      cx={NAV_ICON_UI.centerX}
      cy={NAV_ICON_UI.centerY}
      r={NAV_ICON_UI.outerCircleRadius}
    />
    <path d="M10 9.5v5l4-2.5z" fill={isActive ? '#fff' : 'currentColor'} stroke="none" />
  </svg>
);

const SettingsIcon: React.FC<NavIconProps> = ({ className, isActive = false }) => (
  <svg
    viewBox={NAV_ICON_UI.viewBox}
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isActive && (
      <>
        <path d="M10.4 2.8h3.2l.5 2.3c.4.1.8.3 1.2.5l2.2-1.1 2.2 2.2-1.1 2.2c.2.4.3.8.5 1.2l2.3.5v3.2l-2.3.5c-.1.4-.3.8-.5 1.2l1.1 2.2-2.2 2.2-2.2-1.1c-.4.2-.8.3-1.2.5l-.5 2.3h-3.2l-.5-2.3c-.4-.1-.8-.3-1.2-.5l-2.2 1.1-2.2-2.2 1.1-2.2c-.2-.4-.3-.8-.5-1.2l-2.3-.5v-3.2l2.3-.5c.1-.4.3-.8.5-1.2l-1.1-2.2 2.2-2.2 2.2 1.1c.4-.2.8-.3 1.2-.5z" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="3.2" fill="#fff" stroke="none" />
      </>
    )}
    <path d="M10.4 2.8h3.2l.5 2.3c.4.1.8.3 1.2.5l2.2-1.1 2.2 2.2-1.1 2.2c.2.4.3.8.5 1.2l2.3.5v3.2l-2.3.5c-.1.4-.3.8-.5 1.2l1.1 2.2-2.2 2.2-2.2-1.1c-.4.2-.8.3-1.2.5l-.5 2.3h-3.2l-.5-2.3c-.4-.1-.8-.3-1.2-.5l-2.2 1.1-2.2-2.2 1.1-2.2c-.2-.4-.3-.8-.5-1.2l-2.3-.5v-3.2l2.3-.5c.1-.4.3-.8.5-1.2l-1.1-2.2 2.2-2.2 2.2 1.1c.4-.2.8-.3 1.2-.5z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

const ProfileIcon: React.FC<NavIconProps> = ({ className, isActive = false }) => (
  <svg
    viewBox={NAV_ICON_UI.viewBox}
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isActive && (
      <>
        <circle cx="12" cy="8" r="4" fill="currentColor" stroke="none" />
        <path d="M5 20a7 7 0 0 1 14 0v1H5z" fill="currentColor" stroke="none" />
      </>
    )}
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" />
  </svg>
);

export const NAV_TABS: readonly SidebarTab[] = ['library', 'lesson', 'profile'] as const;

export const NAV_TAB_META: Record<SidebarTab, NavTabMeta> = {
  library: {
    Icon: LibraryIcon,
  },
  lesson: {
    Icon: LessonIcon,
  },
  settings: {
    Icon: SettingsIcon,
  },
  profile: {
    Icon: ProfileIcon,
  },
};

