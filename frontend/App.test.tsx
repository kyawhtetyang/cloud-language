import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const audioButtonMocks = vi.hoisted(() => ({
  speakTextMock: vi.fn<(text: string, context?: { audioUrl?: string }) => Promise<void>>(
    async () => undefined,
  ),
  cancelSpeechMock: vi.fn(),
}));

vi.mock('./components/AudioButton', () => ({
  speakText: audioButtonMocks.speakTextMock,
  cancelSpeech: audioButtonMocks.cancelSpeechMock,
}));

import App from './App';

const OPEN_SETTINGS_BUTTON_NAME = /Open settings|Mở cài đặt|Settings ဖွင့်မယ်/i;
const DEFAULT_LANGUAGE_BUTTON_NAME = /Default Language|Ngôn ngữ mặc định|မူလဘာသာစကား/i;
const PRONUNCIATION_BUTTON_NAME = /Pronunciation|Phát âm|အသံထွက်/i;
const TOGGLE_ON_LABEL = /On|Bật|ဖွင့်/i;
const ENGLISH_OPTION_NAME = /^(English|Tiếng Anh|အင်္ဂလိပ်)/i;
const PROFILE_TAB_NAME = /Profile|Hồ sơ|ပရိုဖိုင်/i;
const LIBRARY_TAB_NAME = /Library|Thư viện|စာကြည့်တိုက်/i;
const LESSON_TAB_NAME = /Lesson|Bài học|သင်ခန်းစာ/i;

function createLessons() {
  return Array.from({ length: 10 }, (_, index) => ({
    level: 1,
    unit: 1,
    topic: 'Unit Topic',
    english: `English ${index + 1}`,
    burmese: `Burmese ${index + 1}`,
    pronunciation: `Pronunciation ${index + 1}`,
  }));
}

function createTwoUnitLessons() {
  return [
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 1,
      topic: 'Unit 1 Topic',
      english: `English ${index + 1}`,
      burmese: `Burmese ${index + 1}`,
      pronunciation: `Pronunciation ${index + 1}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 2,
      topic: 'Unit 2 Topic',
      english: `English ${index + 11}`,
      burmese: `Burmese ${index + 11}`,
      pronunciation: `Pronunciation ${index + 11}`,
    })),
  ];
}

function createTwoStageLessons() {
  return [
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 1,
      stage: 'A1',
      topic: 'A1 Unit 1 Topic',
      english: `English ${index + 1}`,
      burmese: `Burmese ${index + 1}`,
      pronunciation: `Pronunciation ${index + 1}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 2,
      stage: 'A1',
      topic: 'A1 Unit 2 Topic',
      english: `English ${index + 11}`,
      burmese: `Burmese ${index + 11}`,
      pronunciation: `Pronunciation ${index + 11}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 2,
      unit: 1,
      stage: 'A2',
      topic: 'A2 Unit 1 Topic',
      english: `English ${index + 21}`,
      burmese: `Burmese ${index + 21}`,
      pronunciation: `Pronunciation ${index + 21}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 2,
      unit: 2,
      stage: 'A2',
      topic: 'A2 Unit 2 Topic',
      english: `English ${index + 31}`,
      burmese: `Burmese ${index + 31}`,
      pronunciation: `Pronunciation ${index + 31}`,
    })),
  ];
}

function createTwoUnitHskLessons() {
  return [
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 1,
      topic: 'HSK Unit 1',
      english: `句子 ${index + 1}`,
      burmese: `Translation ${index + 1}`,
      pronunciation: `Pinyin ${index + 1}`,
      audioPath: `/api/hsk-audio-sentence/hsk1/1.1/${index + 1}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 2,
      topic: 'HSK Unit 2',
      english: `句子 ${index + 11}`,
      burmese: `Translation ${index + 11}`,
      pronunciation: `Pinyin ${index + 11}`,
      audioPath: `/api/hsk-audio-sentence/hsk1/1.2/${index + 1}`,
    })),
  ];
}

function createLibrarySections() {
  return [
    {
      key: 'cefr-a1',
      label: 'CEFR A1',
      levelScheme: 'cefr',
      levelCode: 'A1',
      groups: [
        {
          key: 'album-a1-market',
          stage: 'A1',
          groupIndex: 0,
          firstTopicConcise: 'Shop At A Market',
          sourceLabel: 'Shop At A Market',
          collectionLabel: 'CEFR A1',
          coverUrl: '/cover-market.jpg',
          units: [
            {
              stage: 'A1',
              level: 1,
              unit: 1,
              topic: 'Shop At A Market',
            },
          ],
        },
      ],
    },
  ];
}

function mockJsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('App lesson navigation guard', () => {
  const lessons = createLessons();
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('lingo_burmese_profile_name', 'tester');
    localStorage.setItem('lingo_burmese_default_language', 'english');
    audioButtonMocks.speakTextMock.mockClear();
    audioButtonMocks.cancelSpeechMock.mockClear();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(lessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps next disabled at unit boundary when repeat is off', async () => {
    render(<App />);

    const nextButton = await screen.findByRole('button', { name: 'Next' });
    expect(nextButton).toBeDisabled();
    fireEvent.click(nextButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves to next unit directly when next is clicked', async () => {
    const twoUnitLessons = createTwoUnitLessons();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(twoUnitLessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);

    const nextButton = await screen.findByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    expect(await screen.findByText('Unit 2 Topic')).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();
  });


  it('keeps next button label as Next through lesson flow', async () => {
    render(<App />);

    await screen.findByRole('button', { name: 'Next' });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('does not show review toggle in settings', async () => {
    render(<App />);

    await screen.findByRole('button', { name: 'Next' });
    fireEvent.click(screen.getAllByRole('button', { name: PROFILE_TAB_NAME })[0]);
    fireEvent.click(await screen.findByRole('button', { name: OPEN_SETTINGS_BUTTON_NAME }));
    await screen.findByRole('button', { name: DEFAULT_LANGUAGE_BUTTON_NAME });
    expect(screen.queryByText('Review Questions')).not.toBeInTheDocument();
  });

  it('hydrates remote settings and persists updated default language for the active profile', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(lessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(
          mockJsonResponse({
            currentIndex: 0,
            unlockedLevel: 1,
            streak: 5,
            learnLanguage: 'english',
            defaultLanguage: 'vietnamese',
            isPronunciationEnabled: true,
            textScalePercent: 110,
            isBoldTextEnabled: false,
            isAutoScrollEnabled: true,
            isRandomLessonOrderEnabled: false,
            isReviewQuestionsRemoved: false,
            appTheme: 'light',
            voiceProvider: 'default',
          }),
        );
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);

    await screen.findByRole('button', { name: 'Next' });
    fireEvent.click(screen.getAllByRole('button', { name: PROFILE_TAB_NAME })[0]);
    fireEvent.click(await screen.findByRole('button', { name: OPEN_SETTINGS_BUTTON_NAME }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: DEFAULT_LANGUAGE_BUTTON_NAME })).toHaveTextContent(
        /Tiếng Việt|Vietnamese/,
      );
      expect(screen.getByRole('button', { name: PRONUNCIATION_BUTTON_NAME })).toHaveTextContent(TOGGLE_ON_LABEL);
      expect(screen.getByText('110%')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: DEFAULT_LANGUAGE_BUTTON_NAME }));
    fireEvent.click(await screen.findByRole('button', { name: ENGLISH_OPTION_NAME }));

    await waitFor(() => {
      expect(localStorage.getItem('lingo_burmese_default_language:tester')).toBe('english');
    });
  });

  it('moves back to previous learn batch when previous is clicked', async () => {
    render(<App />);

    expect((await screen.findAllByText('English 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 2')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 3')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect((await screen.findAllByText('English 4')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 5')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 6')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect((await screen.findAllByText('English 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 2')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 3')).length).toBeGreaterThan(0);
  });

  it('moves to previous unit start when previous is clicked at unit start', async () => {
    const twoUnitLessons = createTwoUnitLessons();
    audioButtonMocks.speakTextMock.mockImplementation(() => new Promise(() => {}));
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(twoUnitLessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);
    await screen.findByRole('button', { name: 'Next' });

    fireEvent.click(screen.getAllByRole('button', { name: LIBRARY_TAB_NAME })[0]);
    await screen.findAllByRole('button', { name: /open group/i });
    fireEvent.click(screen.getAllByRole('button', { name: /open group/i })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /Unit 2 Topic/i })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: LESSON_TAB_NAME })[0]);

    expect(await screen.findByText('Unit 2 Topic')).toBeInTheDocument();
    expect(screen.getByText('1.2')).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(await screen.findByText('Unit 1 Topic')).toBeInTheDocument();
    expect(screen.getByText('1.1')).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();
  });

  it('loops current unit when repeat-one is enabled', async () => {
    render(<App />);

    expect((await screen.findAllByText('English 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 2')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 3')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Enable repeat all' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enable repeat one' }));

    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }

    expect((await screen.findAllByText('English 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 2')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 3')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect((await screen.findAllByText('English 8')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 9')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 10')).length).toBeGreaterThan(0);
  });

  it('repeat-all wraps within current stage when previous is clicked at stage start', async () => {
    const twoStageLessons = createTwoStageLessons();
    audioButtonMocks.speakTextMock.mockImplementation(() => new Promise(() => {}));
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(twoStageLessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);
    await screen.findByRole('button', { name: 'Next' });

    fireEvent.click(screen.getAllByRole('button', { name: LIBRARY_TAB_NAME })[0]);
    await screen.findAllByRole('button', { name: /open group/i });
    fireEvent.click(screen.getAllByRole('button', { name: /open group/i })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: /A2 Unit 1 Topic/i })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: LESSON_TAB_NAME })[0]);

    expect(await screen.findByText('A2 Unit 1 Topic')).toBeInTheDocument();
    expect(screen.getByText('2.1')).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Enable repeat all' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(await screen.findByText('A2 Unit 2 Topic')).toBeInTheDocument();
    expect(screen.getByText('2.2')).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();
  });

  it('keeps HSK autoplay selection/audio aligned when crossing to next unit', async () => {
    const twoUnitHskLessons = createTwoUnitHskLessons();
    localStorage.setItem('lingo_burmese_learn_language', 'chinese');
    audioButtonMocks.speakTextMock.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(twoUnitHskLessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);
    await screen.findByRole('button', { name: 'Read' });
    fireEvent.click(screen.getByRole('button', { name: 'Read' }));

    await waitFor(() => {
      expect(audioButtonMocks.speakTextMock.mock.calls.length).toBeGreaterThanOrEqual(20);
    }, { timeout: 5000 });

    const firstTwenty = audioButtonMocks.speakTextMock.mock.calls.slice(0, 20);
    for (let i = 0; i < 20; i += 1) {
      const text = firstTwenty[i]?.[0];
      const context = firstTwenty[i]?.[1] as { audioUrl?: string } | undefined;
      const expectedText = `句子 ${i + 1}`;
      const expectedAudio =
        i < 10
          ? `/api/hsk-audio-sentence/hsk1/1.1/${i + 1}`
          : `/api/hsk-audio-sentence/hsk1/1.2/${i - 9}`;
      expect(text).toBe(expectedText);
      expect(context?.audioUrl).toBe(expectedAudio);
    }

    expect(firstTwenty[9]?.[0]).toBe('句子 10');
    expect(firstTwenty[10]?.[0]).toBe('句子 11');
    expect((firstTwenty[9]?.[1] as { audioUrl?: string } | undefined)?.audioUrl)
      .toBe('/api/hsk-audio-sentence/hsk1/1.1/10');
    expect((firstTwenty[10]?.[1] as { audioUrl?: string } | undefined)?.audioUrl)
      .toBe('/api/hsk-audio-sentence/hsk1/1.2/1');
  });

  it('shows a heart-saved track under profile bookmarked lessons in library boot mode', async () => {
    const librarySections = createLibrarySections();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/library?language=')) {
        return Promise.resolve(mockJsonResponse(librarySections));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      if (url.includes('/api/highlights')) {
        return Promise.resolve(mockJsonResponse({ highlights: [] }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Open group 1/i }));
    fireEvent.click((await screen.findAllByRole('button', { name: /^Bookmark$/i }))[0]);

    fireEvent.click(screen.getAllByRole('button', { name: PROFILE_TAB_NAME })[0]);
    fireEvent.click(await screen.findByRole('button', { name: /Bookmark Lesson/i }));

    expect(await screen.findByText('Shop At A Market')).toBeInTheDocument();
  });

});

