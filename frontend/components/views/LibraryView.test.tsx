import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LibraryView } from './LibraryView';
import { LessonData } from '../../types';
import { getAppText } from '../../config/appI18n';

const lessons: LessonData[] = [
  {
    level: 1,
    unit: 1,
    stage: 'A1',
    topic: 'Burmese words',
    english: 'Hello',
    burmese: 'မင်္ဂလာပါ',
    pronunciation: 'mingalaba',
    collectionLabel: 'Collection 1',
    sourceLabel: 'Burmese words',
  },
];

function swipeFromLeftEdge(element: HTMLElement) {
  fireEvent.touchStart(element, {
    touches: [{ identifier: 1, target: element, clientX: 8, clientY: 120 }],
  });
  fireEvent.touchMove(element, {
    touches: [{ identifier: 1, target: element, clientX: 84, clientY: 125 }],
  });
  fireEvent.touchEnd(element, {
    changedTouches: [{ identifier: 1, target: element, clientX: 116, clientY: 126 }],
  });
}

describe('LibraryView topic localization', () => {
  it('localizes known library topic labels when default language is burmese', () => {
    const libraryText = getAppText('burmese').library;
    render(
      <LibraryView
        lessons={lessons}
        defaultLanguage="burmese"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: `${libraryText.openGroupAriaPrefix} 1` }));

    expect(screen.getByRole('button', { name: /မြန်မာ စကားလုံးများ/i })).toBeInTheDocument();
  });

  it('keeps original topic labels when default language is english', () => {
    const libraryText = getAppText('english').library;
    render(
      <LibraryView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: `${libraryText.openGroupAriaPrefix} 1` }));

    expect(screen.getByRole('button', { name: /Burmese words/i })).toBeInTheDocument();
  });

  it('renders completed units with gray style', () => {
    const libraryText = getAppText('english').library;
    render(
      <LibraryView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
        completedUnitKeys={new Set(['1:1'])}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: `${libraryText.openGroupAriaPrefix} 1` }));

    expect(screen.getByLabelText(libraryText.completedUnitAriaLabel)).toBeInTheDocument();
  });

  it('plays unit when row is tapped, and opens lesson from the row action menu', () => {
    const libraryText = getAppText('english').library;
    const onReadAlbum = vi.fn();
    const onSelectUnit = vi.fn();
    render(
      <LibraryView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={onSelectUnit}
        onReadAlbum={onReadAlbum}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: `${libraryText.openGroupAriaPrefix} 1` }));
    fireEvent.click(screen.getByRole('button', { name: /Burmese words/i }));

    expect(onReadAlbum).toHaveBeenCalledWith([{ level: 1, unit: 1 }], expect.any(String));
    expect(onSelectUnit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /More actions 1\.1/i }));
    fireEvent.click(screen.getByRole('button', { name: libraryText.openLessonTitle }));
    expect(onSelectUnit).toHaveBeenCalledWith(1, 1, expect.any(String));
  });

  it('supports swipe-back from album detail to album list', () => {
    const libraryText = getAppText('english').library;
    const { getByTestId } = render(
      <LibraryView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: `${libraryText.openGroupAriaPrefix} 1` }));
    swipeFromLeftEdge(getByTestId('album-detail-view'));

    expect(screen.getByRole('button', { name: `${libraryText.openGroupAriaPrefix} 1` })).toBeInTheDocument();
  });

  it('shows bookmark action when row menu is opened', () => {
    const libraryText = getAppText('english').library;
    render(
      <LibraryView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: `${libraryText.openGroupAriaPrefix} 1` }));
    fireEvent.click(screen.getByRole('button', { name: /More actions 1\.1/i }));

    expect(screen.getByRole('button', { name: /^Bookmark$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: libraryText.downloadedLabel })).not.toBeInTheDocument();
  });

  it('shows album bookmark button in album header controls', () => {
    const libraryText = getAppText('english').library;
    render(
      <LibraryView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: `${libraryText.openGroupAriaPrefix} 1` }));
    expect(screen.getByRole('button', { name: /Bookmark album/i })).toBeInTheDocument();
  });

  it('supports section-key selected album and bookmarks the resolved group key', () => {
    const onToggleAlbumBookmark = vi.fn();
    render(
      <LibraryView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
        selectedAlbumKey="custom-collection-1"
        onToggleAlbumBookmark={onToggleAlbumBookmark}
      />,
    );

    expect(screen.getByTestId('album-detail-view')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Bookmark album/i }));
    expect(onToggleAlbumBookmark).toHaveBeenCalledWith('collection-Collection 1-group-0');
  });
});

