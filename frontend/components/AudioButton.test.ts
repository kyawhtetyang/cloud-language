import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelSpeech, speakText } from './AudioButton';

class MockUtterance {
  text: string;
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('AudioButton audio behavior', () => {
  const speechSynthesisMock = {
    cancel: vi.fn(),
    getVoices: vi.fn(() => [] as SpeechSynthesisVoice[]),
    speak: vi.fn((utterance: MockUtterance) => {
      window.setTimeout(() => utterance.onend?.(), 0);
    }),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance as unknown as typeof SpeechSynthesisUtterance);
    vi.stubGlobal('speechSynthesis', speechSynthesisMock);
    speechSynthesisMock.cancel.mockClear();
    speechSynthesisMock.speak.mockClear();
  });

  afterEach(() => {
    cancelSpeech();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('falls back to speech synthesis when audioUrl is missing', async () => {
    const playPromise = speakText('Hello fallback');
    await vi.runAllTimersAsync();
    await playPromise;

    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
    const utteranceArg = speechSynthesisMock.speak.mock.calls[0][0] as MockUtterance;
    expect(utteranceArg.text).toBe('Hello fallback');
    expect(utteranceArg.lang).toBe('en-US');
  });

  it('uses Chinese locale/voice for chinese learning speech fallback', async () => {
    const zhVoice = { lang: 'zh-CN', name: 'Chinese Voice' } as SpeechSynthesisVoice;
    speechSynthesisMock.getVoices.mockReturnValue([zhVoice]);

    const playPromise = speakText('请问。', { learnLanguage: 'chinese' });
    await vi.runAllTimersAsync();
    await playPromise;

    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
    const utteranceArg = speechSynthesisMock.speak.mock.calls[0][0] as MockUtterance;
    expect(utteranceArg.lang).toBe('zh-CN');
    expect(utteranceArg.voice).toBe(zhVoice);
  });

  it('keeps using speech synthesis when audioUrl is provided', async () => {
    const playPromise = speakText('Speech only', { audioUrl: '/clip.mp3' });
    await vi.runAllTimersAsync();
    await playPromise;

    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
  });
});

