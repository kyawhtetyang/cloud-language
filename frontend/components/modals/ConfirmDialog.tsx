import React from 'react';
import { BUTTON_UI, getActionButtonClass } from '../../config/buttonUi';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  closeAriaLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  cancelLabel,
  confirmLabel,
  closeAriaLabel,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className={BUTTON_UI.dialogDismissOverlay}
        onClick={onCancel}
        aria-label={closeAriaLabel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative w-full max-w-sm rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--surface-default)] p-5 shadow-xl"
      >
        <h3 id="dialog-title" className="text-lg font-extrabold text-[var(--portfolio-text)]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 ${getActionButtonClass({ variant: 'secondary', size: 'sm' })}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 ${getActionButtonClass({ variant: 'primary', size: 'sm' })}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

