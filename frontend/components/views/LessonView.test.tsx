import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LessonView } from './LessonView';
import type { LessonData } from '../../types';

const lesson: LessonData = {
  level: 1,
  unit: 1,
  topic: 'Greeting',
  english: 'Hello there',
  burmese: 'မင်္ဂလာပါ',
  pronunciation: 'heh-loh',
};

describe('LessonView', () => {
  it('applies active style to pronunciation line when row is active and pronunciation is enabled', () => {
    render(
      <LessonView
        currentIndex={0}
        currentBatchEntries={[{ lesson, lessonIndex: 0 }]}
        englishReferenceByKey={new Map()}
        defaultLanguage="english"
        isPronunciationEnabled
        isBoldTextEnabled={false}
        learnLanguage="english"
        activeSpeakingLessonIndex={0}
      />,
    );

    const pronunciationLine = document.querySelector('.lesson-row-pronunciation');
    const sourceLine = document.querySelector('.lesson-row-source');
    const translationLine = document.querySelector('.lesson-row-translation');

    expect(pronunciationLine).not.toBeNull();
    expect(sourceLine).not.toBeNull();
    expect(translationLine).not.toBeNull();
    expect(pronunciationLine).toHaveStyle({ color: 'var(--color-brand)' });
    expect(sourceLine).toHaveStyle({ color: 'var(--color-brand)' });
    expect(translationLine).toHaveStyle({ color: 'var(--color-brand)' });
  });

  it('shows lesson-level hint when pronunciation is missing for some rows', () => {
    const lessonWithPronunciation: LessonData = {
      ...lesson,
      english: 'Where are you going?',
      pronunciation: 'wehr ar yoo go-ing',
    };
    const lessonWithoutPronunciation: LessonData = {
      ...lesson,
      english: 'I am home',
      pronunciation: '',
    };

    render(
      <LessonView
        currentIndex={0}
        currentBatchEntries={[
          { lesson: lessonWithPronunciation, lessonIndex: 0 },
          { lesson: lessonWithoutPronunciation, lessonIndex: 1 },
        ]}
        englishReferenceByKey={new Map()}
        defaultLanguage="english"
        isPronunciationEnabled
        isBoldTextEnabled={false}
        learnLanguage="english"
      />,
    );

    expect(screen.getByText('Some pronunciation is coming soon.')).toBeInTheDocument();
  });

  it('shows lesson-level hint when pronunciation is missing for all rows', () => {
    const lessonWithoutPronunciation: LessonData = {
      ...lesson,
      english: 'I am home',
      pronunciation: '',
    };

    render(
      <LessonView
        currentIndex={0}
        currentBatchEntries={[{ lesson: lessonWithoutPronunciation, lessonIndex: 0 }]}
        englishReferenceByKey={new Map()}
        defaultLanguage="english"
        isPronunciationEnabled
        isBoldTextEnabled={false}
        learnLanguage="english"
      />,
    );

    expect(screen.getByText('Pronunciation coming soon.')).toBeInTheDocument();
  });

  it('uses bold class only when bold setting is enabled', () => {
    const { rerender } = render(
      <LessonView
        currentIndex={0}
        currentBatchEntries={[{ lesson, lessonIndex: 0 }]}
        englishReferenceByKey={new Map()}
        defaultLanguage="english"
        isPronunciationEnabled
        isBoldTextEnabled={false}
        learnLanguage="english"
      />,
    );

    const sourceLine = document.querySelector('.lesson-row-source');
    expect(sourceLine).not.toBeNull();
    expect(sourceLine?.className).toContain('font-normal');
    expect(sourceLine?.className).not.toContain('font-bold');

    rerender(
      <LessonView
        currentIndex={0}
        currentBatchEntries={[{ lesson, lessonIndex: 0 }]}
        englishReferenceByKey={new Map()}
        defaultLanguage="english"
        isPronunciationEnabled
        isBoldTextEnabled
        learnLanguage="english"
      />,
    );

    const boldSourceLine = document.querySelector('.lesson-row-source');
    expect(boldSourceLine).not.toBeNull();
    expect(boldSourceLine?.className).toContain('font-bold');
  });
});

