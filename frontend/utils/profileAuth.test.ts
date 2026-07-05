import { beforeEach, describe, expect, it } from 'vitest';
import { SUPABASE_SESSION_KEY } from '../config/appConfig';
import { buildProfileAuthHeaders } from './profileAuth';

describe('buildProfileAuthHeaders', () => {
  beforeEach(() => {
    localStorage.clear();
    (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_SUPABASE_URL = '';
    (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_SUPABASE_ANON_KEY = '';
  });

  it('returns legacy profile-secret header when no supabase session exists', () => {
    const headers = buildProfileAuthHeaders('tester');
    expect(typeof headers['X-Profile-Secret']).toBe('string');
    expect(headers['X-Profile-Secret']?.length).toBeGreaterThanOrEqual(24);
    expect(headers.Authorization).toBeUndefined();
  });

  it('prefers supabase bearer header when access token is present', () => {
    localStorage.setItem(
      SUPABASE_SESSION_KEY,
      JSON.stringify({
        access_token: 'supabase-token-123',
      }),
    );

    const headers = buildProfileAuthHeaders('tester');
    expect(headers.Authorization).toBe('Bearer supabase-token-123');
    expect(headers['X-Profile-Secret']).toBeUndefined();
  });
});

