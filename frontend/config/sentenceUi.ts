export function resolveSentenceTextScale(textScalePercent?: number): number {
  if (!Number.isFinite(textScalePercent)) return 1;
  return Math.min(1.2, Math.max(0.9, Number(textScalePercent) / 100));
}

export function buildSentenceScaleStyle(textScalePercent?: number): Record<string, string> {
  return {
    '--lesson-text-scale': String(resolveSentenceTextScale(textScalePercent)),
  };
}

export function getSentenceWeightClass(isBoldTextEnabled: boolean): string {
  return isBoldTextEnabled ? 'font-bold' : 'font-normal';
}

