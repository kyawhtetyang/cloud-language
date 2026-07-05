import { DefaultLanguage } from './appConfig';
import { getAppText } from './appI18n';

export type LessonModalText = {
  leaveCompletedUnitModalTitle: string;
  leaveCompletedUnitConfirmMessage: string;
  leaveCompletedUnitCancelLabel: string;
  leaveCompletedUnitConfirmLabel: string;
};

export function getLessonModalText(defaultLanguage: DefaultLanguage): LessonModalText {
  const text = getAppText(defaultLanguage).modals.leaveCompletedUnit;
  return {
    leaveCompletedUnitModalTitle: text.title,
    leaveCompletedUnitConfirmMessage: text.message,
    leaveCompletedUnitCancelLabel: text.cancelLabel,
    leaveCompletedUnitConfirmLabel: text.confirmLabel,
  };
}

