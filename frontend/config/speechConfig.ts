import type { LearnLanguage } from './appConfig';

export type SpeechLanguageProfile = {
  locale: string;
  prefix: string;
};

export const DEFAULT_SPEECH_LANGUAGE_PROFILE: SpeechLanguageProfile = {
  locale: 'en-US',
  prefix: 'en-',
};

export const SPEECH_LANGUAGE_PROFILES: Record<LearnLanguage, SpeechLanguageProfile> = {
  burmese: {
    locale: 'my-MM',
    prefix: 'my-',
  },
  english: {
    locale: 'en-US',
    prefix: 'en-',
  },
  chinese: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
  vietnamese: {
    locale: 'vi-VN',
    prefix: 'vi-',
  },
  thai: {
    locale: 'th-TH',
    prefix: 'th-',
  },
};

export function getSpeechLanguageProfile(learnLanguage?: string): SpeechLanguageProfile {
  if (!learnLanguage) return DEFAULT_SPEECH_LANGUAGE_PROFILE;
  return SPEECH_LANGUAGE_PROFILES[learnLanguage as LearnLanguage] || DEFAULT_SPEECH_LANGUAGE_PROFILE;
}

