import { getSpeechLanguageProfile, SpeechLanguageProfile } from '../config/speechConfig';
import { VoiceProvider } from '../config/appConfig';

type SpeakContext = {
  learnLanguage?: string;
  unitId?: number;
  audioUrl?: string;
  voiceProvider?: VoiceProvider;
  onStart?: () => void;
  onEnd?: () => void;
};

let activeSpeechSession = 0;

function pickVoiceForProfile(profile: SpeechLanguageProfile): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window) || typeof window.speechSynthesis.getVoices !== 'function') {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const lowerLocale = profile.locale.toLowerCase();
  const prefixMatch = profile.prefix.toLowerCase();
  const languageMatch = voices.find((voice) => voice.lang?.toLowerCase().startsWith(lowerLocale));
  if (languageMatch) return languageMatch;
  const broadLanguageMatch = voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefixMatch));
  return broadLanguageMatch || null;
}

function pickAppleFemaleVoice(profile: SpeechLanguageProfile): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window) || typeof window.speechSynthesis.getVoices !== 'function') {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const lowerLocale = profile.locale.toLowerCase();
  const prefixMatch = profile.prefix.toLowerCase();
  const localeVoices = voices.filter(
    (voice) =>
      voice.lang?.toLowerCase().startsWith(lowerLocale)
      || voice.lang?.toLowerCase().startsWith(prefixMatch),
  );
  const appleFemalePriority = ['siri', 'samantha', 'ava', 'karen', 'victoria', 'female'];
  const score = (voice: SpeechSynthesisVoice): number => {
    const name = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
    let total = 0;
    if (name.includes('apple') || name.includes('siri')) total += 4;
    const index = appleFemalePriority.findIndex((token) => name.includes(token));
    if (index >= 0) total += 3 - Math.min(index, 2);
    return total;
  };
  const ranked = [...localeVoices].sort((a, b) => score(b) - score(a));
  if (ranked.length > 0 && score(ranked[0]) > 0) return ranked[0];
  return null;
}

export function cancelSpeech(): void {
  activeSpeechSession += 1;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakText(
  text: string,
  context?: SpeakContext,
): Promise<void> {
  if (typeof text !== 'string' || text.trim().length === 0) return Promise.resolve();
  if (!('speechSynthesis' in window)) return Promise.resolve();

  const sessionId = activeSpeechSession + 1;
  activeSpeechSession = sessionId;
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const speechProfile = getSpeechLanguageProfile(context?.learnLanguage);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechProfile.locale;
    const preferredVoice =
      context?.voiceProvider === 'apple_siri'
        ? pickAppleFemaleVoice(speechProfile) || pickVoiceForProfile(speechProfile)
        : pickVoiceForProfile(speechProfile);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.onstart = () => {
      try {
        context?.onStart?.();
      } catch {
        // Ignore caller callback failures to avoid breaking speech flow.
      }
    };
    utterance.onend = () => {
      try {
        context?.onEnd?.();
      } catch {
        // Ignore caller callback failures to avoid breaking speech flow.
      }
      done();
    };
    utterance.onerror = () => {
      try {
        context?.onEnd?.();
      } catch {
        // Ignore caller callback failures to avoid breaking speech flow.
      }
      done();
    };
    window.speechSynthesis.speak(utterance);
    if (activeSpeechSession !== sessionId) done();
  });
}

