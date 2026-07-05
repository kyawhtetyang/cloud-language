import React from 'react';
import type { DefaultLanguage } from '../../../config/appConfig';
import { getAppText } from '../../../config/appI18n';
import { localizeCollectionLabel, localizeLibraryTopic } from '../../../config/libraryI18n';
import type { AlbumCollectionSection, AlbumGroup } from './libraryTypes';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';

type AlbumListProps = {
  sections: AlbumCollectionSection[];
  defaultLanguage: DefaultLanguage;
  onOpenAlbum: (albumKey: string) => void;
  formatAlbumMeta: (group: AlbumGroup) => string;
};

function shortenLabel(text: string, max = 56): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

export const AlbumList: React.FC<AlbumListProps> = ({
  sections,
  defaultLanguage,
  onOpenAlbum,
  formatAlbumMeta,
}) => {
  const libraryText = getAppText(defaultLanguage).library;
  return (
    <>
      {sections.map((section) => (
        <section key={section.key} className={`${LIBRARY_UI_TOKENS.sectionWrap} space-y-3`}>
          <div className={LIBRARY_UI_TOKENS.sectionHeaderBar}>
            <p className={LIBRARY_UI_TOKENS.sectionHeaderText}>
              {localizeCollectionLabel(
                section.label,
                defaultLanguage,
                section.levelScheme,
                section.levelCode,
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
            {section.groups.map((group) => (
              <button
                key={group.key}
                type="button"
                onClick={() => onOpenAlbum(group.key)}
                aria-label={`${libraryText.openGroupAriaPrefix} ${group.groupIndex + 1}`}
                className="group mx-auto w-full max-w-[170px] text-left sm:max-w-[180px]"
              >
                <div className="aspect-square overflow-hidden rounded-2xl border border-[#D7DEE8] bg-[#F2F4F7] shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:bg-[#E8EDF3]">
                  <img
                    src={group.coverUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="truncate text-[13px] font-medium leading-tight text-[var(--portfolio-text)]">
                    {shortenLabel(localizeLibraryTopic(group.firstTopicConcise, defaultLanguage), 32)}
                  </p>
                  <p className="truncate text-[11px] text-[var(--text-secondary)]">
                    {formatAlbumMeta(group)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
};

