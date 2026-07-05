import { PROFILE_AUTH_SECRET_KEY } from '../config/appConfig';
import { buildSupabaseAuthHeaders } from './supabaseAuth';

function buildProfileSecretStorageKey(profileStorageId: string): string {
  return `${PROFILE_AUTH_SECRET_KEY}:${profileStorageId}`;
}

function generateProfileSecret(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  }
  const randomValue = Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}${randomValue}${randomValue}`.padEnd(32, '0');
}

export function readProfileSecret(profileStorageId: string): string {
  const normalizedProfileStorageId = profileStorageId.trim();
  if (!normalizedProfileStorageId) return '';
  try {
    return localStorage.getItem(buildProfileSecretStorageKey(normalizedProfileStorageId))?.trim() || '';
  } catch {
    return '';
  }
}

export function getOrCreateProfileSecret(profileStorageId: string): string {
  const normalizedProfileStorageId = profileStorageId.trim();
  if (!normalizedProfileStorageId) return '';

  const existing = readProfileSecret(normalizedProfileStorageId);
  if (existing) return existing;

  const nextSecret = generateProfileSecret();
  try {
    localStorage.setItem(buildProfileSecretStorageKey(normalizedProfileStorageId), nextSecret);
  } catch {
    // Keep profile auth resilient in storage-restricted environments.
  }
  return nextSecret;
}

export function buildProfileAuthHeaders(profileStorageId: string): Record<string, string> {
  const bearerHeaders = buildSupabaseAuthHeaders();
  if (Object.keys(bearerHeaders).length > 0) {
    return bearerHeaders;
  }
  const profileSecret = getOrCreateProfileSecret(profileStorageId);
  if (!profileSecret) return {};
  return { 'X-Profile-Secret': profileSecret };
}

