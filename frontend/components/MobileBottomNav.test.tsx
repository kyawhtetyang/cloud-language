import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileBottomNav } from './MobileBottomNav';
import { getAppText } from '../config/appI18n';

describe('MobileBottomNav', () => {
  it('highlights the active tab', () => {
    render(
      <MobileBottomNav
        navText={getAppText('english').navigation}
        activeTab="lesson"
        onTabChange={vi.fn()}
      />,
    );

    const lessonButton = screen.getByRole('button', { name: 'Lesson' });
    const profileButton = screen.getByRole('button', { name: 'Profile' });
    const lessonIconWrap = lessonButton.querySelector('span');

    expect(lessonButton.className).toContain('text-brand');
    expect(profileButton.className).toContain('text-[var(--text-secondary)]');
    expect(lessonIconWrap?.className).toContain('bg-transparent');
    expect(lessonIconWrap?.className).toContain('text-brand');
  });

  it('calls onTabChange when buttons are clicked', () => {
    const onTabChange = vi.fn();
    render(
      <MobileBottomNav
        navText={getAppText('english').navigation}
        activeTab="lesson"
        onTabChange={onTabChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Library' }));
    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));

    expect(onTabChange).toHaveBeenNthCalledWith(1, 'library');
    expect(onTabChange).toHaveBeenNthCalledWith(2, 'profile');
  });
});

