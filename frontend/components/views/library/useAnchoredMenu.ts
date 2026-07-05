import React from 'react';

type AnchorRect = DOMRect | null | undefined;

type AnchoredMenuState<T> = {
  activeItem: T | null;
  anchorRect: DOMRect | null;
  isOpen: boolean;
  openMenu: (item: T, anchorRect?: AnchorRect) => void;
  closeMenu: () => void;
};

export function useAnchoredMenu<T>(): AnchoredMenuState<T> {
  const [activeItem, setActiveItem] = React.useState<T | null>(null);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

  const closeMenu = React.useCallback(() => {
    setActiveItem(null);
    setAnchorRect(null);
  }, []);

  const openMenu = React.useCallback((item: T, nextAnchorRect?: AnchorRect) => {
    setActiveItem(item);
    setAnchorRect(nextAnchorRect ?? null);
  }, []);

  return {
    activeItem,
    anchorRect,
    isOpen: activeItem !== null,
    openMenu,
    closeMenu,
  };
}

