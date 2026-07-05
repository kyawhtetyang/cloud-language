import React from 'react';
import {
  VIEW_BODY_TEXT_CLASS,
  VIEW_H2_CLASS,
  VIEW_H3_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_PANEL_CLASS,
  VIEW_PANEL_PAD_CLASS,
  VIEW_STATUS_TEXT_CLASS,
} from './viewShared';
import { getActionButtonClass } from '../../config/buttonUi';
import { AppTextPack } from '../../config/appI18n';

type LessonsUnavailableViewProps = {
  appStateText: AppTextPack['appState'];
  errorMessage: string | null;
  apiBaseUrl: string;
};

type WelcomeViewProps = {
  welcomeText: AppTextPack['welcome'];
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  onProfileInputChange: (value: string) => void;
  onApplyProfileName: () => void;
};

type EmptyLessonSelectionViewProps = {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
};

export const LoadingView: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      <p className={`${VIEW_STATUS_TEXT_CLASS} text-[var(--portfolio-text)]`}>{label}</p>
    </div>
  </div>
);

export const LessonsUnavailableView: React.FC<LessonsUnavailableViewProps> = ({
  appStateText,
  errorMessage,
  apiBaseUrl,
}) => (
  <div className="flex items-center justify-center min-h-screen p-6">
    <div className={`${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS} text-center max-w-md w-full`}>
      <h2 className={`${VIEW_H3_CLASS} mb-2`}>{appStateText.lessonsUnavailableTitle}</h2>
      <p className={VIEW_BODY_TEXT_CLASS}>{errorMessage || appStateText.lessonsUnavailableDefaultMessage}</p>
      <p className={`${VIEW_BODY_TEXT_CLASS} mt-3`}>
        {appStateText.lessonsUnavailableHealthPrefix} {apiBaseUrl}/api/health
      </p>
    </div>
  </div>
);

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  welcomeText,
  profileInput,
  profileError,
  hasProfileWhitespace,
  isProfileInputValid,
  onProfileInputChange,
  onApplyProfileName,
}) => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-app-radial">
    <div className={`${VIEW_PANEL_CLASS} p-7 w-full max-w-md`}>
      <h1 className={`${VIEW_H3_CLASS} mb-2`}>{welcomeText.title}</h1>
      <p className={`${VIEW_BODY_TEXT_CLASS} mb-5`}>{welcomeText.description}</p>
      <input
        value={profileInput}
        onChange={(event) => onProfileInputChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && onApplyProfileName()}
        placeholder={welcomeText.usernamePlaceholder}
        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] px-4 py-3 text-base md:text-sm font-semibold text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
      />
      {(profileError || hasProfileWhitespace) && (
        <p className="mt-2 text-xs font-bold text-danger">{welcomeText.usernameWhitespaceError}</p>
      )}
      <button
        onClick={onApplyProfileName}
        disabled={!isProfileInputValid}
        className={`mt-4 ${getActionButtonClass({
          variant: 'primary',
          size: 'md',
          fullWidth: true,
          disabled: !isProfileInputValid,
        })}`}
      >
        {welcomeText.continueLabel}
      </button>
    </div>
  </div>
);

export const CompletedView: React.FC<{ onRestart: () => void; appStateText: AppTextPack['appState'] }> = ({
  onRestart,
  appStateText,
}) => (
  <div className={`${VIEW_PAGE_CLASS} ${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS} text-center`}>
    <h2 className={`${VIEW_H2_CLASS} mb-3`}>{appStateText.completedTitle}</h2>
    <p className={`${VIEW_BODY_TEXT_CLASS} mb-6`}>{appStateText.completedMessage}</p>
    <button
      onClick={onRestart}
      className={getActionButtonClass({
        variant: 'primary',
        size: 'lg',
        shape: 'large',
        fullWidth: true,
      })}
    >
      {appStateText.completedRestartLabel}
    </button>
  </div>
);

export const EmptyLessonSelectionView: React.FC<EmptyLessonSelectionViewProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <div className={`${VIEW_PAGE_CLASS} ${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS} text-center`}>
    <h2 className={`${VIEW_H2_CLASS} mb-3`}>{title}</h2>
    <p className={`${VIEW_BODY_TEXT_CLASS} mb-6`}>{message}</p>
    <button
      onClick={onAction}
      className={getActionButtonClass({
        variant: 'primary',
        size: 'lg',
        shape: 'large',
        fullWidth: true,
      })}
    >
      {actionLabel}
    </button>
  </div>
);

