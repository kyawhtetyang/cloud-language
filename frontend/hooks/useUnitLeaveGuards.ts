import { Dispatch, SetStateAction, useState } from 'react';
import { AppMode, SidebarTab } from '../config/appConfig';

type PendingUnitTarget = { level: number; unit: number; albumKey?: string | null };

type UseUnitLeaveGuardsParams = {
  mode: AppMode;
  currentLevel: number;
  currentUnit: number;
  learnStep: number;
  learnStepCount: number;
  completedUnitKeys: Set<string>;
  navigateToLibraryUnit: (level: number, unit: number, albumKey?: string | null) => Promise<void>;
  setSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

type UseUnitLeaveGuardsResult = {
  isLeaveCompletedUnitModalOpen: boolean;
  goToLibraryUnit: (level: number, unit: number, albumKey?: string | null) => void;
  handleLeaveCompletedUnitCancel: () => void;
  handleLeaveCompletedUnitConfirm: () => void;
};

export function useUnitLeaveGuards({
  mode,
  currentLevel,
  currentUnit,
  learnStep,
  learnStepCount,
  completedUnitKeys,
  navigateToLibraryUnit,
  setSidebarTab,
  setIsSidebarOpen,
}: UseUnitLeaveGuardsParams): UseUnitLeaveGuardsResult {
  const [pendingUnitTarget, setPendingUnitTarget] = useState<PendingUnitTarget | null>(null);
  const [isLeaveCompletedUnitModalOpen, setIsLeaveCompletedUnitModalOpen] = useState(false);

  const goToLibraryUnit = (level: number, unit: number, albumKey?: string | null) => {
    const targetUnitKey = `${Math.max(1, level)}:${Math.max(1, unit)}`;
    const isSwitchingUnit = targetUnitKey !== `${currentLevel}:${currentUnit}`;
    const currentUnitKey = `${currentLevel}:${currentUnit}`;
    const isCurrentUnitAlreadyCompleted = completedUnitKeys.has(currentUnitKey);
    const isUnitLearnStepCompleted = mode === 'learn' && learnStep >= learnStepCount - 1;

    if (
      isSwitchingUnit
      && isUnitLearnStepCompleted
      && !isCurrentUnitAlreadyCompleted
    ) {
      setPendingUnitTarget({ level, unit, albumKey });
      setIsLeaveCompletedUnitModalOpen(true);
      return;
    }

    void navigateToLibraryUnit(level, unit, albumKey);
  };

  const handleLeaveCompletedUnitCancel = () => {
    setIsLeaveCompletedUnitModalOpen(false);
    setPendingUnitTarget(null);
    setSidebarTab('lesson');
    setIsSidebarOpen(false);
  };

  const handleLeaveCompletedUnitConfirm = () => {
    if (pendingUnitTarget) {
      void navigateToLibraryUnit(pendingUnitTarget.level, pendingUnitTarget.unit, pendingUnitTarget.albumKey);
    }
    setIsLeaveCompletedUnitModalOpen(false);
    setPendingUnitTarget(null);
  };

  return {
    isLeaveCompletedUnitModalOpen,
    goToLibraryUnit,
    handleLeaveCompletedUnitCancel,
    handleLeaveCompletedUnitConfirm,
  };
}

