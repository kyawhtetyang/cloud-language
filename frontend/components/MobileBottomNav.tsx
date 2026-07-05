import React from 'react';
import { SidebarTab } from '../config/appConfig';
import { NAV_ICON_UI, NAV_LAYOUT_UI, NAV_TAB_META, NAV_TABS } from './nav/navConfig';
import {
  getMobileNavButtonClass,
  getMobileNavLabelClass,
} from '../config/buttonUi';
import { AppTextPack } from '../config/appI18n';

type MobileBottomNavProps = {
  navText: AppTextPack['navigation'];
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isVisible?: boolean;
  navTabs?: SidebarTab[];
  isBookTheme?: boolean;
  isBookDarkTheme?: boolean;
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  navText,
  activeTab,
  onTabChange,
  isVisible = true,
  navTabs,
  isBookTheme = false,
}) => {
  const tabs = navTabs ?? NAV_TABS;
  const labelByTab: Record<SidebarTab, string> = {
    library: navText.libraryLabel,
    lesson: navText.lessonLabel,
    profile: navText.profileLabel,
    settings: navText.settingsLabel,
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur transition-all duration-200 ease-out md:hidden ${
        isBookTheme
          ? 'portfolio-mobile-nav'
          : 'border-t border-[var(--border-subtle)] bg-[var(--surface-default)]'
      } ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div
        className={NAV_LAYOUT_UI.mobileGridClass}
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const { Icon } = NAV_TAB_META[tab];
          const label = labelByTab[tab];
          const isActive = activeTab === tab;
          const buttonClass = isBookTheme
            ? `portfolio-mobile-nav-button flex h-14 flex-col items-center justify-center gap-1 rounded-xl transition-all ${
              isActive ? 'portfolio-mobile-nav-button-active' : ''
            }`
            : getMobileNavButtonClass(isActive);
          const iconWrapClass = 'flex items-center justify-center transition-all';
          const labelClass = isBookTheme
            ? `text-xs font-bold leading-none ${isActive ? 'portfolio-mobile-nav-button-active' : 'portfolio-mobile-nav-button'}`
            : getMobileNavLabelClass(isActive);
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              aria-label={label}
              title={label}
              className={buttonClass}
            >
              <span className={iconWrapClass}>
                <Icon isActive={isActive} className={NAV_ICON_UI.mobileSizeClass} />
              </span>
              <span className={labelClass}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

