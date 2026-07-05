import React from 'react';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import { BUTTON_UI } from '../../config/buttonUi';

type AppDialogsProps = {
  leaveCompletedUnitModalProps: React.ComponentProps<typeof ConfirmDialog>;
  logoutModalProps: React.ComponentProps<typeof ConfirmDialog>;
  isSidebarOpen: boolean;
  closeSidebarAriaLabel: string;
  onDismissSidebarOverlay: () => void;
};

export const AppDialogs: React.FC<AppDialogsProps> = ({
  leaveCompletedUnitModalProps,
  logoutModalProps,
  isSidebarOpen,
  closeSidebarAriaLabel,
  onDismissSidebarOverlay,
}) => (
  <>
    <ConfirmDialog {...leaveCompletedUnitModalProps} />
    <ConfirmDialog {...logoutModalProps} />
    {isSidebarOpen && (
      <button
        className={BUTTON_UI.sidebarDismissOverlay}
        onClick={onDismissSidebarOverlay}
        aria-label={closeSidebarAriaLabel}
      />
    )}
  </>
);

