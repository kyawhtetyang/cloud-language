import { useState } from 'react';

export function useProfileProgress(profileNameKey: string) {
  const [profileName, setProfileName] = useState<string>(() => {
    try {
      return localStorage.getItem(profileNameKey)?.trim() || '';
    } catch {
      return '';
    }
  });
  const [profileInput, setProfileInput] = useState(profileName);
  const [profileError, setProfileError] = useState<string | null>(null);

  const trimmedProfileInput = profileInput.trim();
  const hasProfileWhitespace = /\s/.test(trimmedProfileInput);
  const isProfileInputValid = trimmedProfileInput.length > 0 && !hasProfileWhitespace;

  const applyProfileName = (onApplied?: (nextName: string) => void) => {
    const nextName = trimmedProfileInput;
    if (!nextName) return;
    if (/\s/.test(nextName)) {
      setProfileError('Username cannot contain spaces.');
      return;
    }

    setProfileError(null);
    localStorage.setItem(profileNameKey, nextName);
    setProfileName(nextName);
    setProfileInput(nextName);
    onApplied?.(nextName);
  };

  const onProfileInputChange = (nextValue: string) => {
    setProfileInput(nextValue);
    if (profileError) setProfileError(null);
  };

  return {
    profileName,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    setProfileName,
    setProfileInput: onProfileInputChange,
    applyProfileName,
  };
}






