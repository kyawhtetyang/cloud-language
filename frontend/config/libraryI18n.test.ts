import { describe, expect, it } from 'vitest';
import { getLibraryText, localizeCollectionLabel, localizeLibraryTopic } from './libraryI18n';

describe('libraryI18n', () => {
  it('returns burmese library text for burmese default language', () => {
    expect(getLibraryText('burmese').library).toBe('စာကြည့်တိုက်');
  });

  it('returns vietnamese library text for vietnamese default language', () => {
    expect(getLibraryText('vietnamese').library).toBe('Thư viện');
  });

  it('falls back to english library text when language pack is missing', () => {
    expect(getLibraryText('french' as never).library).toBe('Library');
  });

  it('localizes full library unit titles for burmese', () => {
    expect(localizeLibraryTopic('Alphabet sounds & basic pronunciation', 'burmese')).toBe(
      'အက္ခရာအသံများနှင့် အခြေခံအသံထွက်',
    );
  });

  it('keeps source topic when no mapping exists for the selected language', () => {
    expect(localizeLibraryTopic('Alphabet sounds & basic pronunciation', 'french' as never)).toBe(
      'Alphabet sounds & basic pronunciation',
    );
  });

  it('localizes CEFR collection labels by metadata', () => {
    expect(localizeCollectionLabel('beginner a1', 'vietnamese', 'cefr', 'A1')).toBe('Sơ cấp (A1)');
    expect(localizeCollectionLabel('upper intermediate b2', 'burmese', 'cefr', 'B2')).toBe('အလယ်တန်းမြင့် (B2)');
  });
});

