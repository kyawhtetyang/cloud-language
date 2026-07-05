import React, { useEffect, useRef, useState } from 'react';
import { LessonData } from '../../types';
import {
  DefaultLanguage,
  hasLessonLearningPronunciation,
  getPlayableLessonText,
  LearnLanguage,
  resolveLessonLearningPronunciationText,
  resolveLessonLearningSourceText,
  resolveLessonTranslationText,
} from '../../config/appConfig';
import {
  LESSON_AUTO_SCROLL_MIN_INTERVAL_MS,
  LESSON_AUTO_SCROLL_RESUME_DELAY_MS,
  LESSON_AUTO_SCROLL_SAFE_ZONE_RATIO,
  LESSON_LONG_PRESS_MS,
} from '../../config/interactionConfig';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { buildLessonReferenceKey } from '../../utils/lessonReference';
import { getAppText } from '../../config/appI18n';
import { getPillButtonClass } from '../../config/buttonUi';
import { buildSentenceScaleStyle, getSentenceWeightClass } from '../../config/sentenceUi';
import { TOP_TOOLBAR_UI } from '../../config/topToolbarUi';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

type TokenizedHighlightText = {
  tokens: string[];
  joiner: string;
};

type TextMatchRange = {
  start: number;
  end: number;
};

type LessonViewProps = {
  onBackToLibrary?: () => void;
  progressLabel?: string;
  currentIndex: number;
  currentBatchEntries: LessonEntry[];
  allBatchGroups?: LessonEntry[][];
  isRevisionView?: boolean;
  currentStep?: number;
  isReading?: boolean;
  onSelectStep?: (step: number) => void | Promise<void>;
  englishReferenceByKey: Map<string, string>;
  defaultLanguage: DefaultLanguage;
  translationLanguage?: DefaultLanguage;
  isPronunciationEnabled: boolean;
  isLearningLanguageVisible?: boolean;
  isTranslationVisible?: boolean;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled?: boolean;
  textScalePercent?: number;
  learnLanguage: LearnLanguage;
  activeSpeakingLessonIndex?: number | null;
  onPlayLesson?: (lesson: LessonData, lessonIndex: number) => void;
  savedHighlightPhrasesByLessonKey?: Map<string, string[]>;
  onSaveLessonHighlight?: (lesson: LessonData, selectedText: string) => boolean;
  onClearLessonHighlight?: (lesson: LessonData) => boolean;
};

const TOUCH_HIT_X_OFFSETS = [0, -16, 16];
const TOUCH_HIT_Y_OFFSETS = [0, -24, -40, -56, -72];
const VOCAB_HIGHLIGHT_STYLE: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: 'var(--color-danger)',
};
const LESSON_ROW_NO_SELECT_STYLE: React.CSSProperties = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
};
const ACTIVE_SPEAKING_TEXT_STYLE: React.CSSProperties = {
  color: 'var(--color-brand)',
};

function tokenizeLessonTextForHighlight(rawText: string): TokenizedHighlightText {
  const text = String(rawText || '').trim();
  if (!text) return { tokens: [], joiner: ' ' };

  if (/\s/.test(text)) {
    return {
      tokens: text.split(/\s+/).filter(Boolean),
      joiner: ' ',
    };
  }

  if (/[\u4e00-\u9fff]/.test(text)) {
    return {
      tokens: Array.from(text).filter((char) => !/\s/.test(char)),
      joiner: '',
    };
  }

  return { tokens: [text], joiner: ' ' };
}

function findHighlightRanges(text: string, phrases: string[]): TextMatchRange[] {
  const normalizedText = String(text || '');
  if (!normalizedText) return [];
  if (!phrases || phrases.length === 0) return [];

  const lowerText = normalizedText.toLocaleLowerCase();
  const candidateRanges: TextMatchRange[] = [];

  for (const phrase of phrases) {
    const trimmedPhrase = String(phrase || '').trim();
    if (!trimmedPhrase) continue;
    const lowerPhrase = trimmedPhrase.toLocaleLowerCase();
    const isShortSymbolOnlyPhrase =
      trimmedPhrase.length <= 2
      && !/[a-z0-9\u4e00-\u9fff\u1000-\u109f]/i.test(trimmedPhrase);

    let fromIndex = 0;
    while (fromIndex < lowerText.length) {
      const foundAt = lowerText.indexOf(lowerPhrase, fromIndex);
      if (foundAt < 0) break;
      candidateRanges.push({ start: foundAt, end: foundAt + lowerPhrase.length });
      if (isShortSymbolOnlyPhrase) {
        break;
      }
      fromIndex = foundAt + Math.max(1, lowerPhrase.length);
    }
  }

  candidateRanges.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  const acceptedRanges: TextMatchRange[] = [];
  let latestEnd = 0;
  for (const range of candidateRanges) {
    if (range.start < latestEnd) continue;
    acceptedRanges.push(range);
    latestEnd = range.end;
  }
  return acceptedRanges;
}

function renderHighlightedText(text: string, phrases: string[]): React.ReactNode {
  const ranges = findHighlightRanges(text, phrases);
  if (ranges.length === 0) return text;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (cursor < range.start) {
      nodes.push(text.slice(cursor, range.start));
    }
    nodes.push(
      <mark
        key={`hl-${range.start}-${range.end}-${index}`}
        className="rounded px-0.5"
        style={VOCAB_HIGHLIGHT_STYLE}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export const LessonView: React.FC<LessonViewProps> = ({
  onBackToLibrary,
  currentIndex,
  currentBatchEntries,
  allBatchGroups,
  isRevisionView = false,
  currentStep,
  isReading,
  onSelectStep,
  englishReferenceByKey,
  defaultLanguage,
  translationLanguage = defaultLanguage,
  isPronunciationEnabled,
  isLearningLanguageVisible = true,
  isTranslationVisible = true,
  isBoldTextEnabled,
  isAutoScrollEnabled = true,
  textScalePercent = 100,
  learnLanguage,
  activeSpeakingLessonIndex,
  onPlayLesson,
  savedHighlightPhrasesByLessonKey,
  onSaveLessonHighlight,
  onClearLessonHighlight,
}) => {
  const [localSelectedGroup, setLocalSelectedGroup] = useState<number | null>(null);
  const [highlightModeRowKey, setHighlightModeRowKey] = useState<string | null>(null);
  const [dragStartTokenIndex, setDragStartTokenIndex] = useState<number | null>(null);
  const [dragEndTokenIndex, setDragEndTokenIndex] = useState<number | null>(null);
  const swipeBackHandlers = useSwipeBack(onBackToLibrary);
  const batchRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lessonRowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const longPressTimerRef = useRef<number | null>(null);
  const suppressRowClickRef = useRef<string | null>(null);
  const pendingPressPointRef = useRef<{ rowKey: string; x: number; y: number } | null>(null);
  const latestTapRequestRef = useRef(0);
  const autoScrollPausedUntilRef = useRef(0);
  const lastAutoScrolledLessonIndexRef = useRef<number | null>(null);
  const lastAutoScrollAtRef = useRef(0);

  const appText = getAppText(defaultLanguage);
  const selectedGroupIndex =
    typeof currentStep === 'number' && currentStep >= 0 ? currentStep : (localSelectedGroup ?? 0);
  const visibleLessons: LessonData[] = allBatchGroups && allBatchGroups.length > 0
    ? allBatchGroups.flatMap((entries) => entries.map((entry) => entry.lesson))
    : currentBatchEntries.map((entry) => entry.lesson);
  let pronunciationEligibleCount = 0;
  let pronunciationMissingCount = 0;
  for (const lesson of visibleLessons) {
    const sourceText = resolveLessonLearningSourceText({
      lessonEnglish: lesson.english,
      lessonPronunciation: lesson.pronunciation,
      lessonTranslations: lesson.translations,
      learnLanguage,
    });
    if (!sourceText) continue;
    pronunciationEligibleCount += 1;
    const hasPronunciation = hasLessonLearningPronunciation({
      lessonEnglish: lesson.english,
      lessonPronunciation: lesson.pronunciation,
      lessonTranslations: lesson.translations,
      learnLanguage,
    });
    if (!hasPronunciation) pronunciationMissingCount += 1;
  }
  const pronunciationCoverageHint = !isPronunciationEnabled || pronunciationEligibleCount === 0 || pronunciationMissingCount === 0
    ? ''
    : (pronunciationMissingCount === pronunciationEligibleCount
      ? appText.lesson.pronunciationAllMissingHint
      : appText.lesson.pronunciationSomeMissingHint);
  const lessonTextScaleStyle = buildSentenceScaleStyle(textScalePercent) as React.CSSProperties;
  const shouldCenterRevisionRows = isRevisionView && (!allBatchGroups || allBatchGroups.length === 0);
  const revisionTabBaseClass =
    'portfolio-chip inline-flex min-w-24 items-center justify-center px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide';
  const lessonBodyClass = 'overflow-hidden bg-transparent min-h-[60vh]';
  const singleBatchListClass = shouldCenterRevisionRows
    ? 'px-0 flex min-h-[60vh] flex-col justify-center'
    : 'divide-y divide-[var(--border-subtle)] px-0';

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = null;
  };

  const closeHighlightMode = () => {
    setHighlightModeRowKey(null);
    setDragStartTokenIndex(null);
    setDragEndTokenIndex(null);
  };


  const getTokenIndexAtPoint = (rowKey: string, x: number, y: number): number | null => {
    if (typeof document === 'undefined') return null;
    for (const yOffset of TOUCH_HIT_Y_OFFSETS) {
      for (const xOffset of TOUCH_HIT_X_OFFSETS) {
        const probeX = x + xOffset;
        const probeY = y + yOffset;
        const elementAtPoint = document.elementFromPoint(probeX, probeY);
        if (!elementAtPoint) continue;
        const tokenElement = elementAtPoint.closest(`[data-highlight-row="${rowKey}"][data-token-index]`) as HTMLElement | null;
        if (!tokenElement) continue;
        const tokenIndexRaw = tokenElement.dataset.tokenIndex;
        if (!tokenIndexRaw) continue;
        const tokenIndex = Number(tokenIndexRaw);
        if (Number.isInteger(tokenIndex)) return tokenIndex;
      }
    }
    return null;
  };

  const updateDragSelectionByPoint = (rowKey: string, x: number, y: number) => {
    if (highlightModeRowKey !== rowKey) return;
    const tokenIndex = getTokenIndexAtPoint(rowKey, x, y);
    if (tokenIndex === null) return;

    setDragStartTokenIndex((previousStart) => {
      if (previousStart === null) {
        setDragEndTokenIndex(tokenIndex);
        return tokenIndex;
      }
      setDragEndTokenIndex(tokenIndex);
      return previousStart;
    });
  };

  const getDraftSelectionPhrase = (lessonText: string): string => {
    const tokenized = tokenizeLessonTextForHighlight(lessonText);
    if (tokenized.tokens.length === 0) return '';
    if (dragStartTokenIndex === null || dragEndTokenIndex === null) return '';
    const from = Math.min(dragStartTokenIndex, dragEndTokenIndex);
    const to = Math.max(dragStartTokenIndex, dragEndTokenIndex);
    return tokenized.tokens.slice(from, to + 1).join(tokenized.joiner).trim();
  };

  const saveDraftSelection = (lesson: LessonData, lessonText: string) => {
    const phrase = getDraftSelectionPhrase(lessonText);
    if (!phrase) return;
    onSaveLessonHighlight?.(lesson, phrase);
    closeHighlightMode();
  };

  const clearSavedSelection = (lesson: LessonData) => {
    onClearLessonHighlight?.(lesson);
    closeHighlightMode();
  };

  const selectWholeSentence = (lessonText: string) => {
    const tokenized = tokenizeLessonTextForHighlight(lessonText);
    if (tokenized.tokens.length === 0) return;
    setDragStartTokenIndex(0);
    setDragEndTokenIndex(tokenized.tokens.length - 1);
  };

  const startLongPress = (rowKey: string, x: number, y: number) => {
    if (typeof window === 'undefined') return;
    clearLongPressTimer();
    pendingPressPointRef.current = { rowKey, x, y };
    longPressTimerRef.current = window.setTimeout(() => {
      setHighlightModeRowKey(rowKey);
      setDragStartTokenIndex(null);
      setDragEndTokenIndex(null);
      suppressRowClickRef.current = rowKey;
      clearLongPressTimer();
      window.requestAnimationFrame(() => {
        const pending = pendingPressPointRef.current;
        if (!pending || pending.rowKey !== rowKey) return;
        updateDragSelectionByPoint(rowKey, pending.x, pending.y);
      });
    }, LESSON_LONG_PRESS_MS);
  };

  const playLesson = (lesson: LessonData, lessonIndex: number) => {
    const speakValue = getPlayableLessonText(lesson, learnLanguage);
    if (!speakValue) return;
    onPlayLesson?.(lesson, lessonIndex);
  };

  const handleRowClick = async (
    lesson: LessonData,
    lessonIndex: number,
    rowKey: string,
    onBeforePlay?: () => void | Promise<void>,
  ) => {
    const requestId = latestTapRequestRef.current + 1;
    latestTapRequestRef.current = requestId;
    if (suppressRowClickRef.current === rowKey) {
      suppressRowClickRef.current = null;
      return;
    }
    if (highlightModeRowKey) return;
    if (onBeforePlay) {
      try {
        await onBeforePlay();
      } catch {
        // Keep tap-to-play resilient even if optional pre-play step handling fails.
      }
    }
    if (latestTapRequestRef.current !== requestId) {
      return;
    }
    playLesson(lesson, lessonIndex);
  };

  const renderInteractiveSelectionText = (lessonText: string, rowKey: string): React.ReactNode => {
    const tokenized = tokenizeLessonTextForHighlight(lessonText);
    const isWordSeparatedLanguage = tokenized.joiner === ' ';

    let selectedFrom: number | null = null;
    let selectedTo: number | null = null;
    if (highlightModeRowKey === rowKey && dragStartTokenIndex !== null && dragEndTokenIndex !== null) {
      selectedFrom = Math.min(dragStartTokenIndex, dragEndTokenIndex);
      selectedTo = Math.max(dragStartTokenIndex, dragEndTokenIndex);
    }

    return (
      <span className={`inline-flex flex-wrap ${isWordSeparatedLanguage ? 'gap-1.5' : 'gap-0.5'}`}>
        {tokenized.tokens.map((token, index) => {
          const isSelected =
            selectedFrom !== null && selectedTo !== null && index >= selectedFrom && index <= selectedTo;
          return (
            <span
              key={`${rowKey}-token-${index}`}
              data-highlight-row={rowKey}
              data-token-index={index}
              className="inline-flex min-h-7 items-center rounded px-1.5 py-0.5"
              style={isSelected ? VOCAB_HIGHLIGHT_STYLE : undefined}
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  const renderLessonRow = (
    lesson: LessonData,
    lessonIndex: number,
    rowKey: string,
    onBeforePlay?: () => void | Promise<void>,
    rowRef?: React.Ref<HTMLDivElement>,
  ) => {
    const lessonKey = buildLessonReferenceKey(lesson);
    const sourceText = resolveLessonLearningSourceText({
      lessonEnglish: lesson.english,
      lessonPronunciation: lesson.pronunciation,
      lessonTranslations: lesson.translations,
      learnLanguage,
    });
    const pronunciationText = resolveLessonLearningPronunciationText({
      lessonEnglish: lesson.english,
      lessonPronunciation: lesson.pronunciation,
      lessonTranslations: lesson.translations,
      learnLanguage,
    });
    const translatedText = resolveLessonTranslationText({
      lessonEnglish: sourceText,
      lessonBurmese: lesson.burmese,
      lessonTranslations: lesson.translations,
      defaultLanguage: translationLanguage,
      learnLanguage,
      englishReferenceText: englishReferenceByKey.get(lessonKey),
    });
    const savedPhrases = savedHighlightPhrasesByLessonKey?.get(lessonKey) ?? [];
    const canShowPronunciation = isPronunciationEnabled && Boolean(pronunciationText);
    const canShowLearningLanguage = isLearningLanguageVisible && Boolean(sourceText);
    const canShowTranslation = isTranslationVisible && Boolean(translatedText);
    const isInteractiveSelecting = canShowLearningLanguage && highlightModeRowKey === rowKey;
    const isActiveSpeaking = activeSpeakingLessonIndex === lessonIndex;
    const selectedPhraseDraft = isInteractiveSelecting ? getDraftSelectionPhrase(sourceText) : '';
    const hasSavedPhrases = savedPhrases.length > 0;
    const canSelectWholeSentence = canShowLearningLanguage && tokenizeLessonTextForHighlight(sourceText).tokens.length > 0;
    const lessonRowLineClass = `text-[var(--portfolio-text)] ${getSentenceWeightClass(isBoldTextEnabled)}`;
    const setCombinedRowRef = (node: HTMLDivElement | null) => {
      if (node) {
        lessonRowRefs.current.set(lessonIndex, node);
      } else {
        lessonRowRefs.current.delete(lessonIndex);
      }
      if (!rowRef) return;
      if (typeof rowRef === 'function') {
        rowRef(node);
        return;
      }
      if ('current' in rowRef) {
        rowRef.current = node;
      }
    };

    const speakerLabel = String(lesson.speaker || '').trim();

    return (
      <div key={rowKey} ref={setCombinedRowRef}>
        <button
          type="button"
          onMouseDown={(event) => {
            if (!canShowLearningLanguage) return;
            if (highlightModeRowKey === rowKey) {
              updateDragSelectionByPoint(rowKey, event.clientX, event.clientY);
              return;
            }
            startLongPress(rowKey, event.clientX, event.clientY);
          }}
          onMouseMove={(event) => {
            if (highlightModeRowKey !== rowKey || event.buttons !== 1) return;
            updateDragSelectionByPoint(rowKey, event.clientX, event.clientY);
          }}
          onMouseUp={() => {
            clearLongPressTimer();
            pendingPressPointRef.current = null;
          }}
          onMouseLeave={() => {
            if (highlightModeRowKey !== rowKey) {
              clearLongPressTimer();
              pendingPressPointRef.current = null;
            }
          }}
          onTouchStart={(event) => {
            if (!canShowLearningLanguage) return;
            const touch = event.touches[0];
            if (!touch) return;
            if (highlightModeRowKey === rowKey) {
              updateDragSelectionByPoint(rowKey, touch.clientX, touch.clientY);
              return;
            }
            startLongPress(rowKey, touch.clientX, touch.clientY);
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            if (highlightModeRowKey !== rowKey) {
              clearLongPressTimer();
              pendingPressPointRef.current = null;
              return;
            }
            if (event.cancelable) event.preventDefault();
            updateDragSelectionByPoint(rowKey, touch.clientX, touch.clientY);
          }}
          onTouchEnd={() => {
            clearLongPressTimer();
            pendingPressPointRef.current = null;
          }}
          onTouchCancel={() => {
            clearLongPressTimer();
            pendingPressPointRef.current = null;
            closeHighlightMode();
          }}
          onClick={() => {
            void handleRowClick(lesson, lessonIndex, rowKey, onBeforePlay);
          }}
          className="selection-hover w-full rounded-lg px-0 py-3 text-left transition-colors"
          style={LESSON_ROW_NO_SELECT_STYLE}
          aria-label={`${appText.lesson.playAudioAriaPrefix} ${sourceText}`}
          title={canShowLearningLanguage ? appText.lesson.highlightHintTitle : undefined}
        >
          <div className="grid grid-cols-[40px,minmax(0,1fr)] gap-3 text-left leading-tight" style={lessonTextScaleStyle}>
            <div className="flex justify-start pt-0.5">
              {speakerLabel ? (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--portfolio-accent)_12%,white)] text-xs font-extrabold text-[var(--portfolio-accent)]">
                  {speakerLabel}
                </span>
              ) : (
                <span className="h-8 w-8" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              {canShowPronunciation && (
                <p
                  className={`lesson-row-pronunciation ${lessonRowLineClass}`}
                  style={isActiveSpeaking ? ACTIVE_SPEAKING_TEXT_STYLE : undefined}
                >
                  {pronunciationText}
                </p>
              )}
              {canShowLearningLanguage && (
                <p
                  className={`lesson-row-source ${lessonRowLineClass}`}
                  style={isActiveSpeaking ? ACTIVE_SPEAKING_TEXT_STYLE : undefined}
                >
                  {isInteractiveSelecting
                    ? renderInteractiveSelectionText(sourceText, rowKey)
                    : renderHighlightedText(sourceText, savedPhrases)}
                </p>
              )}
              {canShowTranslation && (
                <p
                  className={`lesson-row-translation ${lessonRowLineClass}`}
                  style={isActiveSpeaking ? ACTIVE_SPEAKING_TEXT_STYLE : undefined}
                >
                  {translatedText}
                </p>
              )}
            </div>
          </div>
        </button>
        {isInteractiveSelecting && (
          <div className="portfolio-lesson-toolbar mx-0 mb-2 mt-1 flex items-center justify-end gap-2 rounded-xl px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeHighlightMode();
                }}
                className={getPillButtonClass('default')}
              >
                {appText.lesson.highlightCancelLabel}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  clearSavedSelection(lesson);
                }}
                disabled={!hasSavedPhrases}
                className={getPillButtonClass(hasSavedPhrases ? 'selected' : 'muted')}
              >
                {appText.lesson.highlightClearLabel}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  selectWholeSentence(sourceText);
                }}
                disabled={!canSelectWholeSentence}
                className={getPillButtonClass(canSelectWholeSentence ? 'selected' : 'muted')}
              >
                {appText.lesson.highlightAllLabel}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  saveDraftSelection(lesson, sourceText);
                }}
                disabled={!selectedPhraseDraft}
                className={getPillButtonClass(selectedPhraseDraft ? 'selected' : 'muted')}
              >
                {appText.lesson.highlightSaveLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (typeof currentStep === 'number' && currentStep >= 0) {
      setLocalSelectedGroup(currentStep);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isAutoScrollEnabled) return;
    if (!isReading) return;
    if (typeof currentStep !== 'number' || currentStep < 0) return;
    const node = batchRefs.current[currentStep];
    if (!node) return;
    if (typeof node.scrollIntoView !== 'function') return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep, isAutoScrollEnabled, isReading]);

  useEffect(() => {
    closeHighlightMode();
  }, [currentStep]);

  useEffect(() => {
    if (!isAutoScrollEnabled) return;
    if (typeof window === 'undefined') return;
    const pauseAutoScroll = () => {
      autoScrollPausedUntilRef.current = Date.now() + LESSON_AUTO_SCROLL_RESUME_DELAY_MS;
    };
    window.addEventListener('touchstart', pauseAutoScroll, { passive: true });
    window.addEventListener('touchmove', pauseAutoScroll, { passive: true });
    window.addEventListener('wheel', pauseAutoScroll, { passive: true });
    return () => {
      window.removeEventListener('touchstart', pauseAutoScroll);
      window.removeEventListener('touchmove', pauseAutoScroll);
      window.removeEventListener('wheel', pauseAutoScroll);
    };
  }, [isAutoScrollEnabled]);

  useEffect(() => {
    if (!isAutoScrollEnabled) return;
    if (!isReading) return;
    if (typeof activeSpeakingLessonIndex !== 'number') return;
    if (typeof window === 'undefined') return;
    if (Date.now() < autoScrollPausedUntilRef.current) return;

    const rowNode = lessonRowRefs.current.get(activeSpeakingLessonIndex);
    if (!rowNode) return;

    const now = Date.now();
    if (
      lastAutoScrolledLessonIndexRef.current === activeSpeakingLessonIndex
      && (now - lastAutoScrollAtRef.current) < LESSON_AUTO_SCROLL_MIN_INTERVAL_MS
    ) {
      return;
    }

    const rect = rowNode.getBoundingClientRect();
    const viewportHeight = Math.max(window.innerHeight, 1);
    const viewportCenterY = viewportHeight / 2;
    const safeZoneDistance = viewportHeight * LESSON_AUTO_SCROLL_SAFE_ZONE_RATIO;
    const rowCenterY = (rect.top + rect.bottom) / 2;

    if (Math.abs(rowCenterY - viewportCenterY) <= safeZoneDistance) return;

    const targetScrollTop = Math.max(
      0,
      window.scrollY + rowCenterY - viewportCenterY,
    );
    window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    lastAutoScrolledLessonIndexRef.current = activeSpeakingLessonIndex;
    lastAutoScrollAtRef.current = now;
  }, [activeSpeakingLessonIndex, isAutoScrollEnabled, isReading]);

  useEffect(() => () => clearLongPressTimer(), []);

  return (
    <div className="w-full px-1 pt-16 md:px-0 md:pt-20" {...swipeBackHandlers}>
      {isRevisionView ? (
        <div className={TOP_TOOLBAR_UI.wrapWithMargin}>
          <div className={`${TOP_TOOLBAR_UI.rowCenter} portfolio-lesson-header rounded-2xl px-2 py-2`}>
            <button
              type="button"
              className={`${revisionTabBaseClass} portfolio-chip-active`}
              aria-current="page"
            >
              {appText.lesson.revisionReviewTabLabel}
            </button>
            <button
              type="button"
              className={`${revisionTabBaseClass} portfolio-chip-idle opacity-70`}
              disabled
              aria-disabled="true"
            >
              {appText.lesson.revisionQuizTabLabel}
            </button>
          </div>
        </div>
      ) : null}
      {pronunciationCoverageHint && (
        <p className="portfolio-lesson-hint mb-2 rounded-xl px-2.5 py-1.5 text-xs font-medium">
          {pronunciationCoverageHint}
        </p>
      )}
      <div className={lessonBodyClass}>
        {allBatchGroups && allBatchGroups.length > 0 ? (
          <div className="px-0">
            {allBatchGroups.map((entries, batchIdx) => {
              return (
                <React.Fragment key={`batch-${batchIdx}`}>
                  {entries.map(({ lesson, lessonIndex }, idx) => {
                    const rowKey = `lesson-${lessonIndex}-group-${batchIdx}-row-${idx}-l${lesson.level}-u${lesson.unit}`;
                    return renderLessonRow(
                      lesson,
                      lessonIndex,
                      rowKey,
                      () => {
                        setLocalSelectedGroup(batchIdx);
                        if (batchIdx === selectedGroupIndex) return;
                        return onSelectStep?.(batchIdx);
                      },
                      idx === 0
                        ? (node) => {
                            batchRefs.current[batchIdx] = node;
                          }
                        : undefined,
                    );
                  })}
                  {batchIdx < allBatchGroups.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="mx-0 my-1 border-t border-[var(--border-subtle)]"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className={singleBatchListClass}>
            {currentBatchEntries.map(({ lesson, lessonIndex }, idx) => {
              const rowKey = `lesson-${lessonIndex}-single-${currentIndex + idx}-l${lesson.level}-u${lesson.unit}`;
              return renderLessonRow(lesson, lessonIndex, rowKey);
            })}
          </div>
        )}
      </div>
    </div>
  );
};

