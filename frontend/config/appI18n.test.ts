import { describe, expect, it } from 'vitest';
import { getAppText } from './appI18n';

describe('appI18n', () => {
  it('returns localized library text for vietnamese', () => {
    const text = getAppText('vietnamese');
    expect(text.library.playAllLabel).toBe('Đọc tất cả');
    expect(text.library.searchPlaceholder).toBe('Tìm kiếm thư viện');
  });

  it('returns localized logout text for burmese', () => {
    const text = getAppText('burmese');
    expect(text.logoutModal.title).toBe('Log out လုပ်မလား?');
    expect(text.logoutModal.cancelLabel).toBe('မထွက်တော့ဘူး');
  });

  it('returns localized settings text for chinese and thai', () => {
    const chineseText = getAppText('chinese');
    const thaiText = getAppText('thai');

    expect(chineseText.settings.uiLockLanguageLabel).toBe('界面锁定');
    expect(chineseText.settings.appearanceOptions.light).toBe('浅色模式');
    expect(thaiText.settings.uiLockLanguageLabel).toBe('ล็อกภาษา UI');
    expect(thaiText.settings.appearanceOptions.dark).toBe('โหมดมืด');
  });
});

