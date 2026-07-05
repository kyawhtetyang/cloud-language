import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProfileProgress } from './useProfileProgress';

describe('useProfileProgress', () => {
  const profileKey = 'test_profile_name';

  beforeEach(() => {
    localStorage.clear();
  });

  it('rejects usernames containing spaces', () => {
    const { result } = renderHook(() => useProfileProgress(profileKey));

    act(() => {
      result.current.setProfileInput('kyaw htet');
    });
    act(() => {
      result.current.applyProfileName();
    });

    expect(result.current.profileError).toBe('Username cannot contain spaces.');
    expect(result.current.profileName).toBe('');
    expect(localStorage.getItem(profileKey)).toBeNull();
  });

  it('accepts valid usernames and persists to localStorage', () => {
    const { result } = renderHook(() => useProfileProgress(profileKey));

    act(() => {
      result.current.setProfileInput('kyawhtet');
    });
    act(() => {
      result.current.applyProfileName();
    });

    expect(result.current.profileError).toBeNull();
    expect(result.current.profileName).toBe('kyawhtet');
    expect(localStorage.getItem(profileKey)).toBe('kyawhtet');
  });
});





