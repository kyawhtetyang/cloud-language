import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getAppText } from '../../config/appI18n';
import { AppSidebar } from '../layout/AppSidebar';
import { ProfileView } from './ProfileView';
import { SettingsView } from './SettingsView';
import { WelcomeView } from './AppStateViews';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const startsWithLabel = (label: string): RegExp =>
  new RegExp(`^${escapeRegExp(label)}(?:\\s|$)`, 'i');

describe('i18n coverage', () => {
  it('renders vietnamese navigation labels in sidebar', () => {
    const text = getAppText('vietnamese');
    render(
      <AppSidebar
        navText={text.navigation}
        isSidebarOpen
        sidebarTab="profile"
        onClose={vi.fn()}
        onSelectTab={vi.fn()}
        onReload={vi.fn()}
      />,
    );

    expect(screen.getByText('Thư viện')).toBeInTheDocument();
    expect(screen.getByText('Bài học')).toBeInTheDocument();
    expect(screen.getByText('Hồ sơ')).toBeInTheDocument();
  });

  it('renders vietnamese profile labels', () => {
    const text = getAppText('vietnamese');
    render(
      <ProfileView
        profileName="tester"
        progressPercent={10}
        progressLabel="1/10"
        profileText={text.profile}
        defaultLanguage="vietnamese"
        unitPrefixLabel={text.lesson.unitPrefix}
        currentCourseCode="HSK 1 Unit 1"
        activeBookShelf="current_course"
        onBookShelfChange={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );

    expect(screen.getByText('Chào mừng quay lại')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Khóa học hiện tại' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lưu' })).not.toBeInTheDocument();
  });

  it('renders vietnamese settings labels', () => {
    const text = getAppText('vietnamese');
    render(
      <SettingsView
        settingsText={text.settings}
        profileText={text.profile}
        defaultLanguage="vietnamese"
        learnLanguage="english"
        uiLockLanguage="off"
        courseFramework="cefr"
        isPronunciationEnabled
        isLearningLanguageVisible
        isTranslationVisible
        isBoldTextEnabled={false}
        isAutoScrollEnabled
        textScalePercent={100}
        canDecreaseTextSize
        canIncreaseTextSize
        appTheme="light"
        voiceProvider="default"
        profileInput="tester"
        profileError={null}
        hasProfileWhitespace={false}
        isProfileInputValid
        onDefaultLanguageChange={vi.fn()}
        onUiLockLanguageChange={vi.fn()}
        onLearnLanguageChange={vi.fn()}
        onCourseFrameworkChange={vi.fn()}
        onTogglePronunciation={vi.fn()}
        onToggleLearningLanguageVisibility={vi.fn()}
        onToggleTranslationVisibility={vi.fn()}
        onToggleBoldText={vi.fn()}
        onToggleAutoScroll={vi.fn()}
        onDecreaseTextSize={vi.fn()}
        onIncreaseTextSize={vi.fn()}
        onAppThemeChange={vi.fn()}
        onVoiceProviderChange={vi.fn()}
        onProfileInputChange={vi.fn()}
        onApplyProfileName={vi.fn()}
        onRequestLogout={vi.fn()}
        onBackToProfile={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /^Ngôn ngữ mặc định/i })).toBeInTheDocument();
  });

  it.each([
    {
      language: 'english' as const,
      selectedDefaultLanguageLabel: 'Vietnamese',
      selectedLearnLanguageLabel: 'Chinese',
      selectedAppearanceLabel: 'Light Mode',
      selectedVoiceProviderLabel: 'Default',
      englishOptionLabel: 'English',
    },
    {
      language: 'burmese' as const,
      selectedDefaultLanguageLabel: 'ဗီယက်နမ်',
      selectedLearnLanguageLabel: 'တရုတ်',
      selectedAppearanceLabel: 'အလင်း',
      selectedVoiceProviderLabel: 'မူလ',
      englishOptionLabel: 'အင်္ဂလိပ်',
    },
    {
      language: 'vietnamese' as const,
      selectedDefaultLanguageLabel: 'Tiếng Việt',
      selectedLearnLanguageLabel: 'Tiếng Trung',
      selectedAppearanceLabel: 'Sáng',
      selectedVoiceProviderLabel: 'Mặc định',
      englishOptionLabel: 'Tiếng Anh',
    },
  ])('renders localized settings option values for $language UI', ({
    language,
    selectedDefaultLanguageLabel,
    selectedLearnLanguageLabel,
    selectedAppearanceLabel,
    selectedVoiceProviderLabel,
    englishOptionLabel,
  }) => {
    const text = getAppText(language);
    render(
      <SettingsView
        settingsText={text.settings}
        profileText={text.profile}
        defaultLanguage="vietnamese"
        learnLanguage="chinese"
        uiLockLanguage="off"
        courseFramework="cefr"
        isPronunciationEnabled
        isLearningLanguageVisible
        isTranslationVisible
        isBoldTextEnabled={false}
        isAutoScrollEnabled
        textScalePercent={100}
        canDecreaseTextSize
        canIncreaseTextSize
        appTheme="light"
        voiceProvider="default"
        profileInput="tester"
        profileError={null}
        hasProfileWhitespace={false}
        isProfileInputValid
        onDefaultLanguageChange={vi.fn()}
        onUiLockLanguageChange={vi.fn()}
        onLearnLanguageChange={vi.fn()}
        onCourseFrameworkChange={vi.fn()}
        onTogglePronunciation={vi.fn()}
        onToggleLearningLanguageVisibility={vi.fn()}
        onToggleTranslationVisibility={vi.fn()}
        onToggleBoldText={vi.fn()}
        onToggleAutoScroll={vi.fn()}
        onDecreaseTextSize={vi.fn()}
        onIncreaseTextSize={vi.fn()}
        onAppThemeChange={vi.fn()}
        onVoiceProviderChange={vi.fn()}
        onProfileInputChange={vi.fn()}
        onApplyProfileName={vi.fn()}
        onRequestLogout={vi.fn()}
        onBackToProfile={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: startsWithLabel(text.settings.defaultLanguageLabel) }))
      .toHaveTextContent(selectedDefaultLanguageLabel);
    expect(screen.getByRole('button', { name: startsWithLabel(text.settings.learnLanguageLabel) }))
      .toHaveTextContent(selectedLearnLanguageLabel);
    expect(
      screen.getByRole('button', {
        name: startsWithLabel(text.settings.appearanceLabel),
      }),
    )
      .toHaveTextContent(selectedAppearanceLabel);
    expect(screen.getByRole('button', { name: startsWithLabel(text.settings.voiceProviderLabel) }))
      .toHaveTextContent(selectedVoiceProviderLabel);

    fireEvent.click(screen.getByRole('button', { name: startsWithLabel(text.settings.defaultLanguageLabel) }));
    expect(screen.getByRole('button', { name: new RegExp(englishOptionLabel, 'i') })).toBeInTheDocument();
  });

  it('renders burmese welcome labels', () => {
    const text = getAppText('burmese');
    render(
      <WelcomeView
        welcomeText={text.welcome}
        profileInput=""
        profileError={null}
        hasProfileWhitespace={false}
        isProfileInputValid={false}
        onProfileInputChange={vi.fn()}
        onApplyProfileName={vi.fn()}
      />,
    );

    expect(screen.getByText('ကြိုဆိုပါတယ်')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ဆက်သွားမယ်' })).toBeInTheDocument();
  });
});

