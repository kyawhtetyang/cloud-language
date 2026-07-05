import { useCallback, useRef } from 'react';
import type { TouchEvent } from 'react';

type UseSwipeBackOptions = {
  minDistance?: number;
  edgeThreshold?: number;
  maxVerticalDrift?: number;
};

type SwipeBackTouchState = {
  startX: number;
  startY: number;
  isEligible: boolean;
};

type SwipeBackHandlers = {
  onTouchStart: (event: TouchEvent<HTMLElement>) => void;
  onTouchMove: (event: TouchEvent<HTMLElement>) => void;
  onTouchEnd: (event: TouchEvent<HTMLElement>) => void;
  onTouchCancel: () => void;
};

export function useSwipeBack(
  onBack?: (() => void) | null,
  options?: UseSwipeBackOptions,
): SwipeBackHandlers {
  const minDistance = options?.minDistance ?? 72;
  const edgeThreshold = options?.edgeThreshold ?? 36;
  const maxVerticalDrift = options?.maxVerticalDrift ?? 56;
  const touchStateRef = useRef<SwipeBackTouchState | null>(null);

  const resetTouchState = useCallback(() => {
    touchStateRef.current = null;
  }, []);

  const onTouchStart = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (!onBack) return;
      if (event.touches.length !== 1) {
        resetTouchState();
        return;
      }
      const touch = event.touches[0];
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        isEligible: touch.clientX <= edgeThreshold,
      };
    },
    [edgeThreshold, onBack, resetTouchState],
  );

  const onTouchMove = useCallback((event: TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 1) {
      touchStateRef.current = null;
    }
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (!onBack) return;
      const state = touchStateRef.current;
      resetTouchState();
      if (!state || !state.isEligible) return;
      if (event.changedTouches.length !== 1) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      if (deltaX < minDistance) return;
      if (Math.abs(deltaY) > maxVerticalDrift) return;
      if (deltaX <= Math.abs(deltaY) * 1.2) return;
      onBack();
    },
    [maxVerticalDrift, minDistance, onBack, resetTouchState],
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: resetTouchState,
  };
}

