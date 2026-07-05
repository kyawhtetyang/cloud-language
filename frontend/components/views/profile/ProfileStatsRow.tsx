import React from 'react';

type ProfileStatsRowProps = {
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
};

const ROW_CLASS =
  'w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]';
const LABEL_CLASS = 'text-base font-medium text-[var(--text-primary)]';
const VALUE_CLASS = 'flex items-center gap-2 text-sm font-normal text-[var(--text-secondary)]';

export const ProfileStatsRow: React.FC<ProfileStatsRowProps> = ({
  label,
  value,
  onClick,
}) => (
  <button type="button" onClick={onClick} className={ROW_CLASS}>
    <span className={LABEL_CLASS}>{label}</span>
    <span className={VALUE_CLASS}>
      {value}
      <span aria-hidden="true">&gt;</span>
    </span>
  </button>
);

