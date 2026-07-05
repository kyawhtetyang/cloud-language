import React from 'react';
import type { DefaultLanguage } from '../../../config/appConfig';
import { getAppText } from '../../../config/appI18n';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';

type AlbumHeaderProps = {
  query: string;
  defaultLanguage: DefaultLanguage;
  onQueryChange: (value: string) => void;
};

export const AlbumHeader: React.FC<AlbumHeaderProps> = ({
  query,
  defaultLanguage,
  onQueryChange,
}) => {
  const appText = getAppText(defaultLanguage);
  return (
    <div className={LIBRARY_UI_TOKENS.searchWrap}>
      <label htmlFor="library-search" className="sr-only">
        {appText.library.searchLabel}
      </label>
      <div className={LIBRARY_UI_TOKENS.searchRow}>
        <span aria-hidden="true" className={LIBRARY_UI_TOKENS.searchIcon}>
          🔍
        </span>
        <input
          id="library-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={appText.library.searchPlaceholder}
          className={LIBRARY_UI_TOKENS.searchInput}
        />
      </div>
    </div>
  );
};

