import React from 'react';
import { SidebarTab } from '../../config/appConfig';
import { NAV_ICON_UI, NAV_LAYOUT_UI, NAV_TAB_META } from '../nav/navConfig';
import { BUTTON_UI, getSidebarNavButtonClass } from '../../config/buttonUi';
import { AppTextPack } from '../../config/appI18n';

type AppSidebarProps = {
  navText: AppTextPack['navigation'];
  isSidebarOpen: boolean;
  sidebarTab: SidebarTab;
  isBookTheme?: boolean;
  isBookDarkTheme?: boolean;
  onClose: () => void;
  onSelectTab: (tab: SidebarTab) => void;
  onReload: () => void;
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  navText,
  isSidebarOpen,
  sidebarTab,
  isBookTheme = false,
  onClose,
  onSelectTab,
  onReload,
}) => {
  const labelByTab: Record<SidebarTab, string> = {
    library: navText.libraryLabel,
    lesson: navText.lessonLabel,
    profile: navText.profileLabel,
    settings: navText.settingsLabel,
  };

  const renderNavButton = (tab: SidebarTab) => {
    const { Icon } = NAV_TAB_META[tab];
    const isActive = sidebarTab === tab;
    if (isBookTheme) {
      return (
        <button
          onClick={() => onSelectTab(tab)}
          aria-label={labelByTab[tab]}
          title={labelByTab[tab]}
          className={`w-full flex items-center md:justify-center lg:justify-between gap-3 md:px-3 lg:px-4 py-2.5 rounded-lg transition-all duration-200 group ${
            isActive ? 'portfolio-sidebar-button-active' : 'portfolio-sidebar-button'
          }`}
        >
          <span className="flex min-w-0 items-center gap-3 md:justify-center lg:justify-start">
            <span className={isActive ? 'text-[#fa233b]' : 'text-[var(--portfolio-text-muted)]'}>
              <Icon isActive={isActive} className={NAV_ICON_UI.sidebarSizeClass} />
            </span>
            <span className={`hidden truncate text-sm font-semibold lg:inline ${isActive ? 'text-[#fa233b]' : 'text-[var(--portfolio-text)]'}`}>
              {labelByTab[tab]}
            </span>
          </span>
        </button>
      );
    }
    return (
      <button
        onClick={() => onSelectTab(tab)}
        className={getSidebarNavButtonClass(isActive)}
      >
        <span className={NAV_LAYOUT_UI.sidebarItemContentClass}>
          <Icon isActive={isActive} className={NAV_ICON_UI.sidebarSizeClass} />
          <span className={NAV_LAYOUT_UI.sidebarLabelClass}>{labelByTab[tab]}</span>
        </span>
      </button>
    );
  };

  const profileMeta = NAV_TAB_META.profile;
  const isProfileActive = sidebarTab === 'profile' || sidebarTab === 'settings';
  const ProfileIcon = profileMeta.Icon;
  const BrandGlobeIcon = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4a12 12 0 0 1 0 16" />
      <path d="M12 4a12 12 0 0 0 0 16" />
    </svg>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 z-40 transform transition-transform md:w-20 lg:w-64 md:translate-x-0 ${
        isBookTheme
          ? 'portfolio-glass-sidebar border-r border-black/5 p-6 md:px-3 md:py-6 lg:p-6'
          : 'border-r-2 border-brand-border bg-[var(--surface-default)] p-5'
      } ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="mb-10 flex items-center justify-between md:px-0 lg:pl-2">
          <button
            type="button"
            onClick={onReload}
            className={`flex w-full items-center justify-center gap-2 rounded-xl transition-opacity hover:opacity-85 lg:justify-start ${
              isBookTheme
                ? ''
                : 'text-lg font-extrabold text-ink uppercase tracking-wide'
            }`}
            aria-label={navText.reloadPageAriaLabel}
          >
            <span className={isBookTheme ? 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portfolio-accent)] text-white' : BUTTON_UI.sidebarBrandIcon}>
              {BrandGlobeIcon}
            </span>
            <span className={isBookTheme ? 'hidden text-2xl font-bold tracking-tight text-[var(--portfolio-text)] lg:inline' : ''}>
              CloudLanguage
            </span>
          </button>
          <button className={BUTTON_UI.sidebarCloseButton} onClick={onClose} aria-label={navText.closeAriaLabel}>
            ×
          </button>
        </div>

        <div className="mb-4 space-y-1">
          {renderNavButton('library')}
          {renderNavButton('lesson')}
        </div>

        <div className="mt-auto">
          {isBookTheme ? (
            <button
              onClick={() => onSelectTab('profile')}
              aria-label={labelByTab.profile}
              title={labelByTab.profile}
              className={`w-full flex items-center md:justify-center lg:justify-start gap-3 md:px-3 lg:px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isProfileActive ? 'portfolio-sidebar-button-active' : 'portfolio-sidebar-button'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3 md:justify-center lg:justify-start">
                <span className={isProfileActive ? 'text-[#fa233b]' : 'text-[var(--portfolio-text-muted)]'}>
                  <ProfileIcon isActive={isProfileActive} className={NAV_ICON_UI.sidebarSizeClass} />
                </span>
                <span className={`hidden truncate text-sm font-semibold lg:inline ${isProfileActive ? 'text-[#fa233b]' : 'text-[var(--portfolio-text)]'}`}>
                  {labelByTab.profile}
                </span>
              </span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('profile')}
              className={getSidebarNavButtonClass(isProfileActive, true)}
            >
              <span className={NAV_LAYOUT_UI.sidebarItemContentClass}>
                <ProfileIcon isActive={isProfileActive} className={NAV_ICON_UI.sidebarSizeClass} />
                <span className={NAV_LAYOUT_UI.sidebarLabelClass}>{labelByTab.profile}</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

