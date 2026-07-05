import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LessonView } from './LessonView';
import { SettingsView } from './SettingsView';
import { LessonData } from '../../types';
import { getAppText } from '../../config/appI18n';

function swipeFromLeftEdge(element: HTMLElement) {
  fireEvent.touchStart(element, {
    touches: [{ identifier: 1, target: element, clientX: 10, clientY: 120 }],
  });
  fireEvent.touchMove(element, {
    touches: [{ identifier: 1, target: element, clientX: 88, clientY: 124 }],
  });
  fireEvent.touchEnd(element, {
    changedTouches: [{ identifier: 1, target: element, clientX: 120, clientY: 126 }],
  });
}

describe('Swipe-back behavior', () => {
  it('triggers lesson back handler on valid edge swipe', () => {
    const onBackToLibrary = vi.fn();
    const lesson: LessonData = {
      level: 1,
      unit: 1,
      stage: 'A1',
      topic: 'Greetings',
      english: 'Hello',
      burmese: 'မင်္ဂလာပါ',
      pronunciation: 'mingalaba',
    };

    const { container } = render(
      <LessonView
        onBackToLibrary={onBackToLibrary}
        currentIndex={0}
        currentBatchEntries={[{ lesson, lessonIndex: 0 }]}
        englishReferenceByKey={new Map()}
        defaultLanguage="english"
        isPronunciationEnabled
        isBoldTextEnabled={false}
        learnLanguage="burmese"
      />,
    );

    swipeFromLeftEdge(container.firstElementChild as HTMLElement);
    expect(onBackToLibrary).toHaveBeenCalledTimes(1);
  });

  it('returns from settings subpage to main page on edge swipe', () => {
    const { container } = render(
      <SettingsView
        settingsText={getAppText('english').settings}
        profileText={getAppText('english').profile}
        defaultLanguage="english"
        learnLanguage="burmese"
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
        appTheme="dark"
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

    fireEvent.click(screen.getByRole('button', { name: /default language/i }));
    expect(screen.getByLabelText(/back to settings/i)).toBeInTheDocument();

    swipeFromLeftEdge(container.firstElementChild as HTMLElement);
    expect(screen.queryByLabelText(/back to settings/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /default language/i })).toBeInTheDocument();
  });

  it('disables conflicting learn-language option when default and learn language are equal', () => {
    const onLearnLanguageChange = vi.fn();
    render(
      <SettingsView
        settingsText={getAppText('english').settings}
        profileText={getAppText('english').profile}
        defaultLanguage="english"
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
        appTheme="dark"
        voiceProvider="default"
        profileInput="tester"
        profileError={null}
        hasProfileWhitespace={false}
        isProfileInputValid
        onDefaultLanguageChange={vi.fn()}
        onUiLockLanguageChange={vi.fn()}
        onLearnLanguageChange={onLearnLanguageChange}
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

    const learnLanguageButton = screen.getByRole('button', { name: /learn language/i });
    expect(learnLanguageButton).not.toBeDisabled();
    fireEvent.click(learnLanguageButton);

    const englishOption = screen.getByRole('button', { name: /english on/i });
    expect(englishOption).toBeDisabled();
    fireEvent.click(englishOption);
    expect(onLearnLanguageChange).not.toHaveBeenCalled();
  });

  it('shows ui-lock options and applies selected value', () => {
    const onUiLockLanguageChange = vi.fn();
    render(
      <SettingsView
        settingsText={getAppText('english').settings}
        profileText={getAppText('english').profile}
        defaultLanguage="english"
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
        appTheme="dark"
        voiceProvider="default"
        profileInput="tester"
        profileError={null}
        hasProfileWhitespace={false}
        isProfileInputValid
        onDefaultLanguageChange={vi.fn()}
        onUiLockLanguageChange={onUiLockLanguageChange}
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

    fireEvent.click(screen.getByRole('button', { name: /ui lock/i }));
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    expect(onUiLockLanguageChange).toHaveBeenCalledWith('english');
  });

  it('allows selecting hsk framework for thai learn language', () => {
    const onCourseFrameworkChange = vi.fn();
    render(
      <SettingsView
        settingsText={getAppText('english').settings}
        profileText={getAppText('english').profile}
        defaultLanguage="english"
        learnLanguage="thai"
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
        appTheme="dark"
        voiceProvider="default"
        profileInput="tester"
        profileError={null}
        hasProfileWhitespace={false}
        isProfileInputValid
        onDefaultLanguageChange={vi.fn()}
        onUiLockLanguageChange={vi.fn()}
        onLearnLanguageChange={vi.fn()}
        onCourseFrameworkChange={onCourseFrameworkChange}
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

    fireEvent.click(screen.getByRole('button', { name: /course framework/i }));

    const hskOption = screen.getByRole('button', { name: /hsk off/i });
    expect(hskOption).not.toBeDisabled();
    fireEvent.click(hskOption);
    expect(onCourseFrameworkChange).toHaveBeenCalledWith('hsk');
  });

});

