import React, { useMemo, useState } from 'react';
import {
  APP_THEME_OPTIONS,
  AppTheme,
  isFrameworkAllowedForLearnLanguage,
  COURSE_FRAMEWORK_OPTIONS,
  CourseFramework,
  DEFAULT_LANGUAGE_OPTIONS,
  DefaultLanguage,
  LEARN_LANGUAGE_OPTIONS,
  LearnLanguage,
  UI_LOCK_LANGUAGE_OPTIONS,
  UiLockLanguage,
  VOICE_PROVIDER_OPTIONS,
  VoiceProvider,
} from '../../config/appConfig';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import {
  getSettingsTextSizeButtonClass,
  getSettingsToggleBadgeClass,
  SETTINGS_UI,
} from '../../config/settingsUi';
import { AppTextPack } from '../../config/appI18n';
import { getActionButtonClass } from '../../config/buttonUi';

type SettingsViewProps = {
  settingsText: AppTextPack['settings'];
  profileText: AppTextPack['profile'];
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  uiLockLanguage: UiLockLanguage;
  courseFramework: CourseFramework;
  isPronunciationEnabled: boolean;
  isLearningLanguageVisible: boolean;
  isTranslationVisible: boolean;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled: boolean;
  textScalePercent: number;
  canDecreaseTextSize: boolean;
  canIncreaseTextSize: boolean;
  appTheme: AppTheme;
  voiceProvider: VoiceProvider;
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  onDefaultLanguageChange: (value: DefaultLanguage) => void;
  onUiLockLanguageChange: (value: UiLockLanguage) => void;
  onLearnLanguageChange: (value: LearnLanguage) => void;
  onCourseFrameworkChange: (value: CourseFramework) => void;
  onTogglePronunciation: () => void;
  onToggleLearningLanguageVisibility: () => void;
  onToggleTranslationVisibility: () => void;
  onToggleBoldText: () => void;
  onToggleAutoScroll: () => void;
  onDecreaseTextSize: () => void;
  onIncreaseTextSize: () => void;
  onAppThemeChange: (value: AppTheme) => void;
  onVoiceProviderChange: (value: VoiceProvider) => void;
  onProfileInputChange: (value: string) => void;
  onApplyProfileName: () => void;
  onRequestLogout: () => void;
  onBackToProfile: () => void;
};

type SettingsRoute =
  | 'main'
  | 'defaultLanguage'
  | 'uiLockLanguage'
  | 'learnLanguage'
  | 'courseFramework'
  | 'appearance'
  | 'voiceProvider';

function findOptionLabel<T extends string>(
  options: ReadonlyArray<{ code: T; label: string }>,
  code: T,
): string {
  return options.find((option) => option.code === code)?.label ?? code;
}

type ToggleStateBadgeProps = {
  isOn: boolean;
  onLabel: string;
  offLabel: string;
};

const ToggleStateBadge: React.FC<ToggleStateBadgeProps> = ({ isOn, onLabel, offLabel }) => (
  <span className={getSettingsToggleBadgeClass(isOn)}>{isOn ? onLabel : offLabel}</span>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  settingsText,
  profileText,
  defaultLanguage,
  learnLanguage,
  uiLockLanguage,
  courseFramework,
  isPronunciationEnabled,
  isLearningLanguageVisible,
  isTranslationVisible,
  isBoldTextEnabled,
  isAutoScrollEnabled,
  textScalePercent,
  canDecreaseTextSize,
  canIncreaseTextSize,
  appTheme,
  voiceProvider,
  profileInput,
  profileError,
  hasProfileWhitespace,
  isProfileInputValid,
  onDefaultLanguageChange,
  onUiLockLanguageChange,
  onLearnLanguageChange,
  onCourseFrameworkChange,
  onTogglePronunciation,
  onToggleLearningLanguageVisibility,
  onToggleTranslationVisibility,
  onToggleBoldText,
  onToggleAutoScroll,
  onDecreaseTextSize,
  onIncreaseTextSize,
  onAppThemeChange,
  onVoiceProviderChange,
  onProfileInputChange,
  onApplyProfileName,
  onRequestLogout,
  onBackToProfile,
}) => {
  const [route, setRoute] = useState<SettingsRoute>('main');
  const swipeBackHandlers = useSwipeBack(
    route !== 'main' ? () => setRoute('main') : null,
  );

  const defaultLanguageLabel = useMemo(
    () => settingsText.defaultLanguageOptions[defaultLanguage] || findOptionLabel(DEFAULT_LANGUAGE_OPTIONS, defaultLanguage),
    [defaultLanguage, settingsText.defaultLanguageOptions],
  );
  const learnLanguageLabel = useMemo(
    () => settingsText.learnLanguageOptions[learnLanguage] || findOptionLabel(LEARN_LANGUAGE_OPTIONS, learnLanguage),
    [learnLanguage, settingsText.learnLanguageOptions],
  );
  const uiLockLanguageLabel = useMemo(
    () => settingsText.uiLockLanguageOptions[uiLockLanguage] || findOptionLabel(UI_LOCK_LANGUAGE_OPTIONS, uiLockLanguage),
    [uiLockLanguage, settingsText.uiLockLanguageOptions],
  );
  const courseFrameworkLabel = useMemo(
    () => settingsText.courseFrameworkOptions[courseFramework] || findOptionLabel(COURSE_FRAMEWORK_OPTIONS, courseFramework),
    [courseFramework, settingsText.courseFrameworkOptions],
  );
  const appThemeLabel = useMemo(
    () => settingsText.appearanceOptions[appTheme] || findOptionLabel(APP_THEME_OPTIONS, appTheme),
    [appTheme, settingsText.appearanceOptions],
  );
  const voiceProviderLabel = useMemo(
    () => settingsText.voiceProviderOptions[voiceProvider] || findOptionLabel(VOICE_PROVIDER_OPTIONS, voiceProvider),
    [voiceProvider, settingsText.voiceProviderOptions],
  );
  const defaultLanguageOptions = useMemo(
    () => DEFAULT_LANGUAGE_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.defaultLanguageOptions[option.code] || option.label,
    })),
    [settingsText.defaultLanguageOptions],
  );
  const learnLanguageOptions = useMemo(
    () => LEARN_LANGUAGE_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.learnLanguageOptions[option.code] || option.label,
    })),
    [settingsText.learnLanguageOptions],
  );
  const uiLockLanguageOptions = useMemo(
    () => UI_LOCK_LANGUAGE_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.uiLockLanguageOptions[option.code] || option.label,
    })),
    [settingsText.uiLockLanguageOptions],
  );
  const courseFrameworkOptions = useMemo(
    () => COURSE_FRAMEWORK_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.courseFrameworkOptions[option.code] || option.label,
    })),
    [settingsText.courseFrameworkOptions],
  );
  const appearanceOptions = useMemo(
    () => APP_THEME_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.appearanceOptions[option.code] || option.label,
    })),
    [settingsText.appearanceOptions],
  );
  const voiceProviderOptions = useMemo(
    () => VOICE_PROVIDER_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.voiceProviderOptions[option.code] || option.label,
    })),
    [settingsText.voiceProviderOptions],
  );

  const subPageMeta: Record<Exclude<SettingsRoute, 'main'>, { title: string }> = {
    defaultLanguage: {
      title: settingsText.defaultLanguageLabel,
    },
    uiLockLanguage: {
      title: settingsText.uiLockLanguageLabel,
    },
    learnLanguage: {
      title: settingsText.learnLanguageLabel,
    },
    courseFramework: {
      title: settingsText.courseFrameworkLabel,
    },
    appearance: {
      title: settingsText.appearanceLabel,
    },
    voiceProvider: {
      title: settingsText.voiceProviderLabel,
    },
  };

  const renderOptionPage = <T extends string>(
    options: ReadonlyArray<{ code: T; label: string }>,
    selectedCode: T,
    onSelect: (value: T) => void,
    isOptionDisabled?: (value: T) => boolean,
  ) => (
    <div className={SETTINGS_UI.listCard}>
      {options.map((option, index) => {
        const isSelected = selectedCode === option.code;
        const isDisabled = isOptionDisabled?.(option.code) ?? false;
        return (
          <React.Fragment key={option.code}>
            <button
              type="button"
              onClick={() => onSelect(option.code)}
              disabled={isDisabled}
              className={`${SETTINGS_UI.listRow}${
                isDisabled ? ' cursor-not-allowed opacity-60 hover:bg-transparent' : ''
              }`}
            >
              <span className={SETTINGS_UI.optionLabel}>{option.label}</span>
              <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
                <ToggleStateBadge
                  isOn={isSelected}
                  onLabel={settingsText.onLabel}
                  offLabel={settingsText.offLabel}
                />
              </span>
            </button>
            {index < options.length - 1 && <div className={SETTINGS_UI.listDivider} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderMainPage = () => (
    <>
      <div className="portfolio-panel mb-6 rounded-3xl px-4 py-5 md:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="portfolio-kicker">{settingsText.profileContextLabel}</p>
            <h3 className="portfolio-page-title">{settingsText.settingsTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onBackToProfile}
            className="portfolio-soft-icon-button rounded-full px-3 py-2 text-sm font-semibold"
            aria-label={settingsText.backToProfileAriaLabel}
          >
            Back
          </button>
        </div>
      </div>

      <section className="mb-4">
        <div className={SETTINGS_UI.listCard}>
          <button type="button" onClick={() => setRoute('defaultLanguage')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.defaultLanguageLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {defaultLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('uiLockLanguage')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.uiLockLanguageLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {uiLockLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('learnLanguage')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.learnLanguageLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {learnLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('courseFramework')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.courseFrameworkLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {courseFrameworkLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('appearance')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.appearanceLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {appThemeLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('voiceProvider')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.voiceProviderLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {voiceProviderLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
        </div>
      </section>

      <section className="mb-4">
        <div className={SETTINGS_UI.listCard}>
          <button type="button" onClick={onToggleBoldText} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.boldTextLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isBoldTextEnabled}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={onToggleAutoScroll} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.autoScrollLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isAutoScrollEnabled}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <div className={SETTINGS_UI.staticRow}>
            <div className={SETTINGS_UI.textSizeRow}>
              <p className={SETTINGS_UI.sectionTitle}>{settingsText.textSizeLabel}</p>
              <div className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.textSizeControlSlot}`}>
                <div className={SETTINGS_UI.textSizeControlGroup}>
                  <button
                    type="button"
                    onClick={onDecreaseTextSize}
                    disabled={!canDecreaseTextSize}
                    className={getSettingsTextSizeButtonClass(canDecreaseTextSize)}
                    aria-label={settingsText.decreaseTextSizeAriaLabel}
                  >
                    -
                  </button>
                  <span className={SETTINGS_UI.textSizeValue}>
                    {textScalePercent}%
                  </span>
                  <button
                    type="button"
                    onClick={onIncreaseTextSize}
                    disabled={!canIncreaseTextSize}
                    className={getSettingsTextSizeButtonClass(canIncreaseTextSize)}
                    aria-label={settingsText.increaseTextSizeAriaLabel}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className={SETTINGS_UI.listCard}>
          <button
            type="button"
            onClick={onTogglePronunciation}
            disabled={isPronunciationEnabled && !isLearningLanguageVisible}
            className={`${SETTINGS_UI.listRow}${
              isPronunciationEnabled && !isLearningLanguageVisible
                ? ' cursor-not-allowed opacity-60 hover:bg-transparent'
                : ''
            }`}
          >
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.pronunciationLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isPronunciationEnabled}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button
            type="button"
            onClick={onToggleLearningLanguageVisibility}
            disabled={isLearningLanguageVisible && !isPronunciationEnabled}
            className={`${SETTINGS_UI.listRow}${
              isLearningLanguageVisible && !isPronunciationEnabled
                ? ' cursor-not-allowed opacity-60 hover:bg-transparent'
                : ''
            }`}
          >
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.learningLanguageVisibilityLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isLearningLanguageVisible}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={onToggleTranslationVisibility} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.translationVisibilityLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isTranslationVisible}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
            </span>
          </button>
        </div>
      </section>

      <section className="mb-4">
        <div className={SETTINGS_UI.listCard}>
          <div className="px-4 py-3">
            <div className="flex gap-2">
              <input
                value={profileInput}
                onChange={(event) => onProfileInputChange(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && onApplyProfileName()}
                placeholder={profileText.displayNamePlaceholder}
                className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] px-3 py-2 text-base font-semibold text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] md:text-sm"
              />
              <button
                type="button"
                onClick={onApplyProfileName}
                disabled={!isProfileInputValid}
                className={getActionButtonClass({
                  variant: 'primary',
                  size: 'sm',
                  disabled: !isProfileInputValid,
                })}
              >
                {profileText.saveLabel}
              </button>
            </div>
            {(profileError || hasProfileWhitespace) && (
              <p className="mt-2 text-xs font-bold text-danger">{profileText.usernameWhitespaceError}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className={SETTINGS_UI.listCard}>
          <button
            type="button"
            onClick={onRequestLogout}
            className={`${SETTINGS_UI.listRow} text-danger`}
          >
            <span className={SETTINGS_UI.sectionTitle}>{profileText.logoutLabel}</span>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </section>
    </>
  );

  const renderSubPage = () => {
    if (route === 'main') return null;
    const { title } = subPageMeta[route];
    return (
      <>
        <div className="portfolio-panel mb-6 rounded-3xl px-4 py-5 md:px-5">
          <button
            type="button"
            onClick={() => setRoute('main')}
            className="portfolio-soft-icon-button rounded-full px-3 py-2 text-sm font-semibold"
            aria-label={settingsText.backToSettingsAriaLabel}
          >
            Back
          </button>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#fa233b]">{settingsText.settingsTitle}</p>
            <h3 className="text-xl font-bold tracking-tight text-[var(--portfolio-text)]">{title}</h3>
          </div>
        </div>
        {route === 'defaultLanguage' &&
          renderOptionPage(defaultLanguageOptions, defaultLanguage, onDefaultLanguageChange)}
        {route === 'uiLockLanguage' &&
          renderOptionPage(uiLockLanguageOptions, uiLockLanguage, onUiLockLanguageChange)}
        {route === 'learnLanguage' &&
          renderOptionPage(
            learnLanguageOptions,
            learnLanguage,
            onLearnLanguageChange,
            (value) => value === defaultLanguage,
          )}
        {route === 'courseFramework' &&
          renderOptionPage(
            courseFrameworkOptions,
            courseFramework,
            onCourseFrameworkChange,
            (value) => !isFrameworkAllowedForLearnLanguage(value, learnLanguage),
          )}
        {route === 'appearance' &&
          renderOptionPage(appearanceOptions, appTheme, onAppThemeChange)}
        {route === 'voiceProvider' &&
          renderOptionPage(voiceProviderOptions, voiceProvider, onVoiceProviderChange)}
      </>
    );
  };

  return (
    <div className="w-full pt-16 md:pt-20" {...swipeBackHandlers}>
      {route === 'main' ? renderMainPage() : renderSubPage()}
    </div>
  );
};

