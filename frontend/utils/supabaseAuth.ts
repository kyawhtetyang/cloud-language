import { SUPABASE_SESSION_KEY } from '../config/appConfig';

type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  user?: Record<string, unknown> | null;
};

type SupabaseAuthResult = {
  session: SupabaseSession;
  user: Record<string, unknown> | null;
};

function getSupabaseUrl(): string {
  const raw = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  return raw.replace(/\/+$/, '');
}

function getSupabaseAnonKey(): string {
  return String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function readSupabaseSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SUPABASE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SupabaseSession>;
    const accessToken = typeof parsed.access_token === 'string' ? parsed.access_token.trim() : '';
    if (!accessToken) return null;
    return {
      access_token: accessToken,
      refresh_token: typeof parsed.refresh_token === 'string' ? parsed.refresh_token : undefined,
      expires_at: typeof parsed.expires_at === 'number' ? parsed.expires_at : undefined,
      token_type: typeof parsed.token_type === 'string' ? parsed.token_type : undefined,
      user: typeof parsed.user === 'object' && parsed.user !== null ? parsed.user as Record<string, unknown> : null,
    };
  } catch {
    return null;
  }
}

export function writeSupabaseSession(session: SupabaseSession): void {
  try {
    localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Keep auth resilient in storage-restricted environments.
  }
}

export function clearSupabaseSession(): void {
  try {
    localStorage.removeItem(SUPABASE_SESSION_KEY);
  } catch {
    // Keep auth resilient in storage-restricted environments.
  }
}

export function readSupabaseAccessToken(): string {
  return readSupabaseSession()?.access_token || '';
}

export function buildSupabaseAuthHeaders(): Record<string, string> {
  const accessToken = readSupabaseAccessToken();
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}

function normalizeAuthResult(payload: unknown): SupabaseAuthResult {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid auth response');
  }
  const raw = payload as Record<string, unknown>;
  const accessToken = typeof raw.access_token === 'string' ? raw.access_token.trim() : '';
  if (!accessToken) {
    throw new Error('Supabase access token missing');
  }

  const session: SupabaseSession = {
    access_token: accessToken,
    refresh_token: typeof raw.refresh_token === 'string' ? raw.refresh_token : undefined,
    expires_at: typeof raw.expires_at === 'number' ? raw.expires_at : undefined,
    token_type: typeof raw.token_type === 'string' ? raw.token_type : undefined,
    user: typeof raw.user === 'object' && raw.user !== null ? raw.user as Record<string, unknown> : null,
  };

  return {
    session,
    user: session.user ?? null,
  };
}

function buildSupabaseHeaders(): Record<string, string> {
  const anonKey = getSupabaseAnonKey();
  return {
    'Content-Type': 'application/json',
    apikey: anonKey,
  };
}

export async function signInWithSupabasePassword(email: string, password: string): Promise<SupabaseAuthResult> {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl || !getSupabaseAnonKey()) {
    throw new Error('Supabase is not configured');
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: buildSupabaseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof (payload as Record<string, unknown>).msg === 'string'
      ? String((payload as Record<string, unknown>).msg)
      : 'Failed to sign in';
    throw new Error(message);
  }
  const result = normalizeAuthResult(payload);
  writeSupabaseSession(result.session);
  return result;
}

export async function signUpWithSupabasePassword(email: string, password: string): Promise<SupabaseAuthResult> {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl || !getSupabaseAnonKey()) {
    throw new Error('Supabase is not configured');
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: buildSupabaseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof (payload as Record<string, unknown>).msg === 'string'
      ? String((payload as Record<string, unknown>).msg)
      : 'Failed to sign up';
    throw new Error(message);
  }
  const result = normalizeAuthResult(payload);
  writeSupabaseSession(result.session);
  return result;
}

