import {
  AppTheme,
  CourseFramework,
  DefaultLanguage,
  LearnLanguage,
  UiLockLanguage,
  VoiceProvider,
} from './appConfig';

export type AppTextPack = {
  navigation: {
    libraryLabel: string;
    lessonLabel: string;
    profileLabel: string;
    settingsLabel: string;
    reloadPageAriaLabel: string;
    closeAriaLabel: string;
  };
  appState: {
    loadingLessonsLabel: string;
    lessonsUnavailableTitle: string;
    lessonsUnavailableDefaultMessage: string;
    lessonsUnavailableHealthPrefix: string;
    lessonsLoadFailedMessage: string;
    completedTitle: string;
    completedMessage: string;
    completedRestartLabel: string;
    unexpectedErrorTitle: string;
    unexpectedErrorMessage: string;
    reloadLabel: string;
  };
  logoutModal: {
    title: string;
    message: string;
    cancelLabel: string;
    confirmLabel: string;
  };
  library: {
    searchLabel: string;
    searchPlaceholder: string;
    playAllLabel: string;
    noAlbumsMatch: string;
    removeDownloadedConfirmMessage: string;
    downloadingLabel: string;
    offlineReadyLabel: string;
    downloadedLabel: string;
    downloadLabel: string;
    openGroupAriaPrefix: string;
    completedUnitAriaLabel: string;
    openLessonAriaPrefix: string;
    openLessonTitle: string;
    backToAlbumsAriaLabel: string;
    bookmarkAlbumLabel: string;
    bookmarkTrackLabel: string;
    unitSingularLabel: string;
    unitPluralLabel: string;
    collectionFallbackPrefix: string;
    untitledSourceLabel: string;
  };

  lesson: {
    revisionReviewTabLabel: string;
    revisionQuizTabLabel: string;
    unitPrefix: string;
    previousLabel: string;
    nextLabel: string;
    readLabel: string;
    stopLabel: string;
    enableShuffleLabel: string;
    disableShuffleLabel: string;
    enableRepeatAllLabel: string;
    enableRepeatOneLabel: string;
    disableRepeatLabel: string;
    playAudioAriaPrefix: string;
    highlightHintTitle: string;
    highlightCancelLabel: string;
    highlightClearLabel: string;
    highlightAllLabel: string;
    highlightSaveLabel: string;
    pronunciationSomeMissingHint: string;
    pronunciationAllMissingHint: string;
    backToLibraryAriaLabel: string;
  };
  welcome: {
    title: string;
    description: string;
    usernamePlaceholder: string;
    usernameWhitespaceError: string;
    continueLabel: string;
  };
  profile: {
    accountSectionLabel: string;
    welcomeBackTitle: string;
    progressStatsSectionLabel: string;
    currentCourseLabel: string;
    downloadedLessonsLabel: string;
    downloadedUnitsTracksLabel: string;
    courseNotAvailableLabel: string;
    changeDisplayNameSectionLabel: string;
    displayNamePlaceholder: string;
    saveLabel: string;
    usernameWhitespaceError: string;
    sessionSectionLabel: string;
    logoutLabel: string;
    openSettingsAriaLabel: string;
  };
  settings: {
    profileContextLabel: string;
    settingsTitle: string;
    preferencesSectionLabel: string;
    displaySectionLabel: string;
    audioSectionLabel: string;
    defaultLanguageLabel: string;
    uiLockLanguageLabel: string;
    learnLanguageLabel: string;
    courseFrameworkLabel: string;
    appearanceLabel: string;
    voiceProviderLabel: string;
    boldTextLabel: string;
    autoScrollLabel: string;
    textSizeLabel: string;
    pronunciationLabel: string;
    learningLanguageVisibilityLabel: string;
    translationVisibilityLabel: string;
    backToProfileAriaLabel: string;
    backToSettingsAriaLabel: string;
    decreaseTextSizeAriaLabel: string;
    increaseTextSizeAriaLabel: string;
    onLabel: string;
    offLabel: string;
    defaultLanguageOptions: Record<DefaultLanguage, string>;
    uiLockLanguageOptions: Record<UiLockLanguage, string>;
    learnLanguageOptions: Record<LearnLanguage, string>;
    courseFrameworkOptions: Record<CourseFramework, string>;
    appearanceOptions: Record<AppTheme, string>;
    voiceProviderOptions: Record<VoiceProvider, string>;
  };
  modals: {
    leaveCompletedUnit: {
      title: string;
      message: string;
      cancelLabel: string;
      confirmLabel: string;
    };
  };
};

const APP_TEXT_ENGLISH: AppTextPack = {
  navigation: {
    libraryLabel: 'Library',
    lessonLabel: 'Lesson',
    profileLabel: 'Profile',
    settingsLabel: 'Settings',
    reloadPageAriaLabel: 'Reload page',
    closeAriaLabel: 'Close',
  },
  appState: {
    loadingLessonsLabel: 'Loading lessons...',
    lessonsUnavailableTitle: 'Lessons unavailable',
    lessonsUnavailableDefaultMessage: 'No lessons available right now.',
    lessonsUnavailableHealthPrefix: 'Check backend API at',
    lessonsLoadFailedMessage: 'Could not load lessons from backend or offline storage.',
    completedTitle: 'All Units Passed',
    completedMessage: 'You completed all sections and passed the random checks.',
    completedRestartLabel: 'Restart Unit 1',
    unexpectedErrorTitle: 'Something went wrong',
    unexpectedErrorMessage: 'The app hit an unexpected error. Reload to recover.',
    reloadLabel: 'Reload',
  },
  logoutModal: {
    title: 'Log out?',
    message: 'Are you sure you want to log out from this profile?',
    cancelLabel: 'Cancel',
    confirmLabel: 'Log out',
  },
  library: {
    searchLabel: 'Search library',
    searchPlaceholder: 'Search library',
    playAllLabel: 'Play all',
    noAlbumsMatch: 'No albums match your search.',
    removeDownloadedConfirmMessage: 'Remove downloaded offline lessons for this group?',
    downloadingLabel: 'Downloading',
    offlineReadyLabel: 'Offline ready',
    downloadedLabel: 'Downloaded',
    downloadLabel: 'Download',
    openGroupAriaPrefix: 'Open group',
    completedUnitAriaLabel: 'Completed unit',
    openLessonAriaPrefix: 'Open lesson',
    openLessonTitle: 'Open lesson',
    backToAlbumsAriaLabel: 'Back',
    bookmarkAlbumLabel: 'Bookmark album',
    bookmarkTrackLabel: 'Bookmark',
    unitSingularLabel: 'unit',
    unitPluralLabel: 'units',
    collectionFallbackPrefix: 'Collection',
    untitledSourceLabel: 'Untitled',
  },

  lesson: {
    revisionReviewTabLabel: 'Review',
    revisionQuizTabLabel: 'Quiz',
    unitPrefix: 'Unit',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    readLabel: 'Read',
    stopLabel: 'Stop',
    enableShuffleLabel: 'Enable shuffle',
    disableShuffleLabel: 'Disable shuffle',
    enableRepeatAllLabel: 'Enable repeat all',
    enableRepeatOneLabel: 'Enable repeat one',
    disableRepeatLabel: 'Disable repeat',
    playAudioAriaPrefix: 'Play audio for',
    highlightHintTitle: 'Tap to hear pronunciation. Tap and hold, then drag to highlight phrase.',
    highlightCancelLabel: 'Cancel',
    highlightClearLabel: 'Clear',
    highlightAllLabel: 'All',
    highlightSaveLabel: 'Save',
    pronunciationSomeMissingHint: 'Some pronunciation is coming soon.',
    pronunciationAllMissingHint: 'Pronunciation coming soon.',
    backToLibraryAriaLabel: 'Back',
  },
  welcome: {
    title: 'Welcome',
    description: 'Enter your name to create a local profile.',
    usernamePlaceholder: 'Username (no spaces)',
    usernameWhitespaceError: 'Username cannot contain spaces.',
    continueLabel: 'Continue',
  },
  profile: {
    accountSectionLabel: 'Account',
    welcomeBackTitle: 'Welcome back',
    progressStatsSectionLabel: 'Progress Stats',
    currentCourseLabel: 'Current Course',
    downloadedLessonsLabel: 'Bookmark Album',
    downloadedUnitsTracksLabel: 'Bookmark Lesson',
    courseNotAvailableLabel: 'Not available',
    changeDisplayNameSectionLabel: 'Change Display Name',
    displayNamePlaceholder: 'Display name (no spaces)',
    saveLabel: 'Save',
    usernameWhitespaceError: 'Username cannot contain spaces.',
    sessionSectionLabel: 'Session',
    logoutLabel: 'Log out',
    openSettingsAriaLabel: 'Open settings',
  },
  settings: {
    profileContextLabel: 'Profile',
    settingsTitle: 'Settings',
    preferencesSectionLabel: 'Preferences',
    displaySectionLabel: 'Display',
    audioSectionLabel: 'Audio',
    defaultLanguageLabel: 'Default Language',
    uiLockLanguageLabel: 'UI Lock',
    learnLanguageLabel: 'Learn Language',
    courseFrameworkLabel: 'Course Framework',
    appearanceLabel: 'Appearance',
    voiceProviderLabel: 'Voice Provider',
    boldTextLabel: 'Bold Text',
    autoScrollLabel: 'Auto Scroll',
    textSizeLabel: 'Text Size',
    pronunciationLabel: 'Pronunciation',
    learningLanguageVisibilityLabel: 'Show Learning Language',
    translationVisibilityLabel: 'Translation',
    backToProfileAriaLabel: 'Back to profile',
    backToSettingsAriaLabel: 'Back to settings',
    decreaseTextSizeAriaLabel: 'Decrease text size',
    increaseTextSizeAriaLabel: 'Increase text size',
    onLabel: 'On',
    offLabel: 'Off',
    defaultLanguageOptions: {
      burmese: 'Burmese',
      english: 'English',
      chinese: 'Chinese',
      thai: 'Thai',
      vietnamese: 'Vietnamese',
    },
    uiLockLanguageOptions: {
      off: 'Off',
      burmese: 'Burmese',
      english: 'English',
      chinese: 'Chinese',
      thai: 'Thai',
      vietnamese: 'Vietnamese',
    },
    learnLanguageOptions: {
      burmese: 'Burmese',
      english: 'English',
      chinese: 'Chinese',
      vietnamese: 'Vietnamese',
      thai: 'Thai',
    },
    courseFrameworkOptions: {
      cefr: 'CEFR',
      hsk: 'HSK',
    },
    appearanceOptions: {
      light: 'Light Mode',
      dark: 'Dark Mode',
    },
    voiceProviderOptions: {
      default: 'Default',
      apple_siri: 'Apple (Siri)',
    },
  },
  modals: {
    leaveCompletedUnit: {
      title: 'Finish this unit first?',
      message: 'You reached 10/10 for this unit. Stay on this unit or leave it?',
      cancelLabel: 'Stay on Unit',
      confirmLabel: 'Leave Unit',
    },
  },
};

const APP_TEXT_CHINESE: AppTextPack = {
  ...APP_TEXT_ENGLISH,
  navigation: {
    ...APP_TEXT_ENGLISH.navigation,
    libraryLabel: '课程库',
    lessonLabel: '课程',
    profileLabel: '个人',
    settingsLabel: '设置',
    reloadPageAriaLabel: '重新加载页面',
    closeAriaLabel: '关闭',
  },
  appState: {
    ...APP_TEXT_ENGLISH.appState,
    loadingLessonsLabel: '正在加载课程...',
    lessonsUnavailableTitle: '暂无课程',
    lessonsUnavailableDefaultMessage: '当前没有可用课程。',
    lessonsUnavailableHealthPrefix: '检查后端 API：',
    lessonsLoadFailedMessage: '无法从后端或离线存储加载课程。',
    completedTitle: '全部课程已完成',
    completedMessage: '你已完成所有部分并通过随机测试。',
    completedRestartLabel: '重新开始第 1 单元',
    unexpectedErrorTitle: '发生错误',
    unexpectedErrorMessage: '应用出现意外错误，请重新加载。',
    reloadLabel: '重新加载',
  },
  logoutModal: {
    ...APP_TEXT_ENGLISH.logoutModal,
    title: '退出登录？',
    message: '确定要退出当前资料吗？',
    cancelLabel: '取消',
    confirmLabel: '退出',
  },
  library: {
    ...APP_TEXT_ENGLISH.library,
    searchLabel: '搜索课程库',
    searchPlaceholder: '搜索课程库',
    playAllLabel: '全部朗读',
    noAlbumsMatch: '没有匹配的专辑。',
    removeDownloadedConfirmMessage: '要移除此分组已下载的离线课程吗？',
    downloadingLabel: '下载中',
    offlineReadyLabel: '可离线使用',
    downloadedLabel: '已下载',
    downloadLabel: '下载',
    openGroupAriaPrefix: '打开分组',
    completedUnitAriaLabel: '已完成单元',
    openLessonAriaPrefix: '打开课程',
    openLessonTitle: '打开课程',
    backToAlbumsAriaLabel: '返回',
    bookmarkAlbumLabel: '收藏专辑',
    bookmarkTrackLabel: '收藏',
    unitSingularLabel: '单元',
    unitPluralLabel: '单元',
    collectionFallbackPrefix: '合集',
    untitledSourceLabel: '未命名',
  },

  lesson: {
    ...APP_TEXT_ENGLISH.lesson,
    revisionReviewTabLabel: '复习',
    revisionQuizTabLabel: '测验',
    unitPrefix: '单元',
    previousLabel: '上一项',
    nextLabel: '下一项',
    readLabel: '朗读',
    stopLabel: '停止',
    enableShuffleLabel: '开启随机播放',
    disableShuffleLabel: '关闭随机播放',
    enableRepeatAllLabel: '开启全部循环',
    enableRepeatOneLabel: '开启单曲循环',
    disableRepeatLabel: '关闭循环',
    playAudioAriaPrefix: '播放音频：',
    highlightHintTitle: '点击收听发音。长按并拖动即可高亮词组。',
    highlightCancelLabel: '取消',
    highlightClearLabel: '清除',
    highlightAllLabel: '全部',
    highlightSaveLabel: '保存',
    pronunciationSomeMissingHint: '部分发音即将上线。',
    pronunciationAllMissingHint: '发音即将上线。',
    backToLibraryAriaLabel: '返回',
  },
  welcome: {
    ...APP_TEXT_ENGLISH.welcome,
    title: '欢迎',
    description: '输入你的名字以创建本地资料。',
    usernamePlaceholder: '用户名（不含空格）',
    usernameWhitespaceError: '用户名不能包含空格。',
    continueLabel: '继续',
  },
  profile: {
    ...APP_TEXT_ENGLISH.profile,
    accountSectionLabel: '账号',
    welcomeBackTitle: '欢迎回来',
    progressStatsSectionLabel: '学习进度',
    currentCourseLabel: '当前课程',
    downloadedLessonsLabel: '已收藏专辑',
    downloadedUnitsTracksLabel: '已收藏课程',
    courseNotAvailableLabel: '暂无',
    changeDisplayNameSectionLabel: '修改显示名称',
    displayNamePlaceholder: '显示名称（不含空格）',
    saveLabel: '保存',
    usernameWhitespaceError: '用户名不能包含空格。',
    sessionSectionLabel: '会话',
    logoutLabel: '退出登录',
    openSettingsAriaLabel: '打开设置',
  },
  settings: {
    ...APP_TEXT_ENGLISH.settings,
    profileContextLabel: '个人',
    settingsTitle: '设置',
    preferencesSectionLabel: '偏好',
    displaySectionLabel: '显示',
    audioSectionLabel: '音频',
    defaultLanguageLabel: '默认语言',
    uiLockLanguageLabel: '界面锁定',
    learnLanguageLabel: '学习语言',
    courseFrameworkLabel: '课程框架',
    appearanceLabel: '外观',
    voiceProviderLabel: '语音提供方',
    boldTextLabel: '粗体文字',
    autoScrollLabel: '自动滚动',
    textSizeLabel: '文字大小',
    pronunciationLabel: '发音',
    learningLanguageVisibilityLabel: '显示学习语言',
    translationVisibilityLabel: '翻译',
    backToProfileAriaLabel: '返回个人页',
    backToSettingsAriaLabel: '返回设置',
    decreaseTextSizeAriaLabel: '减小文字',
    increaseTextSizeAriaLabel: '增大文字',
    onLabel: '开',
    offLabel: '关',
    defaultLanguageOptions: {
      burmese: '缅甸语',
      english: '英语',
      chinese: '中文',
      thai: '泰语',
      vietnamese: '越南语',
    },
    uiLockLanguageOptions: {
      off: '关闭',
      burmese: '缅甸语',
      english: '英语',
      chinese: '中文',
      thai: '泰语',
      vietnamese: '越南语',
    },
    learnLanguageOptions: {
      burmese: '缅甸语',
      english: '英语',
      chinese: '中文',
      vietnamese: '越南语',
      thai: '泰语',
    },
    courseFrameworkOptions: {
      cefr: 'CEFR',
      hsk: 'HSK',
    },
    appearanceOptions: {
      light: '浅色模式',
      dark: '深色模式',
    },
    voiceProviderOptions: {
      default: '默认',
      apple_siri: 'Apple (Siri)',
    },
  },
  modals: {
    ...APP_TEXT_ENGLISH.modals,
    leaveCompletedUnit: {
      title: '先完成这个单元？',
      message: '你已完成本单元 10/10。要留在本单元还是离开？',
      cancelLabel: '留在本单元',
      confirmLabel: '离开单元',
    },
  },
};

const APP_TEXT_THAI: AppTextPack = {
  ...APP_TEXT_ENGLISH,
  navigation: {
    ...APP_TEXT_ENGLISH.navigation,
    libraryLabel: 'คลังบทเรียน',
    lessonLabel: 'บทเรียน',
    profileLabel: 'โปรไฟล์',
    settingsLabel: 'ตั้งค่า',
    reloadPageAriaLabel: 'โหลดหน้าใหม่',
    closeAriaLabel: 'ปิด',
  },
  appState: {
    ...APP_TEXT_ENGLISH.appState,
    loadingLessonsLabel: 'กำลังโหลดบทเรียน...',
    lessonsUnavailableTitle: 'ไม่มีบทเรียน',
    lessonsUnavailableDefaultMessage: 'ยังไม่มีบทเรียนในตอนนี้',
    lessonsUnavailableHealthPrefix: 'ตรวจสอบ Backend API ที่',
    lessonsLoadFailedMessage: 'ไม่สามารถโหลดบทเรียนจาก backend หรือ offline storage ได้',
    completedTitle: 'ผ่านครบทุกยูนิตแล้ว',
    completedMessage: 'คุณผ่านทุกส่วนและผ่านการทดสอบสุ่มแล้ว',
    completedRestartLabel: 'เริ่มใหม่ที่ยูนิต 1',
    unexpectedErrorTitle: 'เกิดข้อผิดพลาด',
    unexpectedErrorMessage: 'แอปเกิดข้อผิดพลาดที่ไม่คาดคิด โปรดโหลดใหม่',
    reloadLabel: 'โหลดใหม่',
  },
  logoutModal: {
    ...APP_TEXT_ENGLISH.logoutModal,
    title: 'ออกจากระบบ?',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากโปรไฟล์นี้',
    cancelLabel: 'ยกเลิก',
    confirmLabel: 'ออกจากระบบ',
  },
  library: {
    ...APP_TEXT_ENGLISH.library,
    searchLabel: 'ค้นหาในคลัง',
    searchPlaceholder: 'ค้นหาในคลัง',
    playAllLabel: 'อ่านทั้งหมด',
    noAlbumsMatch: 'ไม่พบอัลบั้มที่ตรงกับการค้นหา',
    removeDownloadedConfirmMessage: 'ลบบทเรียนออฟไลน์ที่ดาวน์โหลดไว้สำหรับกลุ่มนี้หรือไม่?',
    downloadingLabel: 'กำลังดาวน์โหลด',
    offlineReadyLabel: 'พร้อมใช้งานออฟไลน์',
    downloadedLabel: 'ดาวน์โหลดแล้ว',
    downloadLabel: 'ดาวน์โหลด',
    openGroupAriaPrefix: 'เปิดกลุ่ม',
    completedUnitAriaLabel: 'ยูนิตที่เรียนจบ',
    openLessonAriaPrefix: 'เปิดบทเรียน',
    openLessonTitle: 'เปิดบทเรียน',
    backToAlbumsAriaLabel: 'กลับ',
    bookmarkAlbumLabel: 'บุ๊กมาร์กอัลบั้ม',
    bookmarkTrackLabel: 'บุ๊กมาร์ก',
    unitSingularLabel: 'ยูนิต',
    unitPluralLabel: 'ยูนิต',
    collectionFallbackPrefix: 'ชุด',
    untitledSourceLabel: 'ไม่มีชื่อ',
  },

  lesson: {
    ...APP_TEXT_ENGLISH.lesson,
    revisionReviewTabLabel: 'ทบทวน',
    revisionQuizTabLabel: 'แบบทดสอบ',
    unitPrefix: 'ยูนิต',
    previousLabel: 'ก่อนหน้า',
    nextLabel: 'ถัดไป',
    readLabel: 'อ่าน',
    stopLabel: 'หยุด',
    enableShuffleLabel: 'เปิดสุ่มลำดับ',
    disableShuffleLabel: 'ปิดสุ่มลำดับ',
    enableRepeatAllLabel: 'เปิดเล่นซ้ำทั้งหมด',
    enableRepeatOneLabel: 'เปิดเล่นซ้ำหนึ่งรายการ',
    disableRepeatLabel: 'ปิดเล่นซ้ำ',
    playAudioAriaPrefix: 'เล่นเสียงสำหรับ',
    highlightHintTitle: 'แตะเพื่อฟังการออกเสียง แตะค้างแล้วลากเพื่อไฮไลต์วลี',
    highlightCancelLabel: 'ยกเลิก',
    highlightClearLabel: 'ล้าง',
    highlightAllLabel: 'ทั้งหมด',
    highlightSaveLabel: 'บันทึก',
    pronunciationSomeMissingHint: 'การออกเสียงบางส่วนจะมาเร็วๆ นี้',
    pronunciationAllMissingHint: 'การออกเสียงจะมาเร็วๆ นี้',
    backToLibraryAriaLabel: 'กลับ',
  },
  welcome: {
    ...APP_TEXT_ENGLISH.welcome,
    title: 'ยินดีต้อนรับ',
    description: 'ใส่ชื่อของคุณเพื่อสร้างโปรไฟล์ในเครื่อง',
    usernamePlaceholder: 'ชื่อผู้ใช้ (ห้ามมีช่องว่าง)',
    usernameWhitespaceError: 'ชื่อผู้ใช้ห้ามมีช่องว่าง',
    continueLabel: 'ต่อไป',
  },
  profile: {
    ...APP_TEXT_ENGLISH.profile,
    accountSectionLabel: 'บัญชี',
    welcomeBackTitle: 'ยินดีต้อนรับกลับ',
    progressStatsSectionLabel: 'สถิติความคืบหน้า',
    currentCourseLabel: 'คอร์สปัจจุบัน',
    downloadedLessonsLabel: 'อัลบั้มที่บุ๊กมาร์ก',
    downloadedUnitsTracksLabel: 'บทเรียนที่บุ๊กมาร์ก',
    courseNotAvailableLabel: 'ยังไม่มี',
    changeDisplayNameSectionLabel: 'เปลี่ยนชื่อแสดงผล',
    displayNamePlaceholder: 'ชื่อแสดงผล (ห้ามมีช่องว่าง)',
    saveLabel: 'บันทึก',
    usernameWhitespaceError: 'ชื่อผู้ใช้ห้ามมีช่องว่าง',
    sessionSectionLabel: 'เซสชัน',
    logoutLabel: 'ออกจากระบบ',
    openSettingsAriaLabel: 'เปิดการตั้งค่า',
  },
  settings: {
    ...APP_TEXT_ENGLISH.settings,
    profileContextLabel: 'โปรไฟล์',
    settingsTitle: 'ตั้งค่า',
    preferencesSectionLabel: 'ตัวเลือก',
    displaySectionLabel: 'การแสดงผล',
    audioSectionLabel: 'เสียง',
    defaultLanguageLabel: 'ภาษาหลัก',
    uiLockLanguageLabel: 'ล็อกภาษา UI',
    learnLanguageLabel: 'ภาษาเรียน',
    courseFrameworkLabel: 'กรอบคอร์ส',
    appearanceLabel: 'หน้าตา',
    voiceProviderLabel: 'ผู้ให้บริการเสียง',
    boldTextLabel: 'ตัวหนา',
    autoScrollLabel: 'เลื่อนอัตโนมัติ',
    textSizeLabel: 'ขนาดตัวอักษร',
    pronunciationLabel: 'การออกเสียง',
    learningLanguageVisibilityLabel: 'แสดงภาษาเรียน',
    translationVisibilityLabel: 'คำแปล',
    backToProfileAriaLabel: 'กลับไปโปรไฟล์',
    backToSettingsAriaLabel: 'กลับไปตั้งค่า',
    decreaseTextSizeAriaLabel: 'ลดขนาดตัวอักษร',
    increaseTextSizeAriaLabel: 'เพิ่มขนาดตัวอักษร',
    onLabel: 'เปิด',
    offLabel: 'ปิด',
    defaultLanguageOptions: {
      burmese: 'พม่า',
      english: 'อังกฤษ',
      chinese: 'จีน',
      thai: 'ไทย',
      vietnamese: 'เวียดนาม',
    },
    uiLockLanguageOptions: {
      off: 'ปิด',
      burmese: 'พม่า',
      english: 'อังกฤษ',
      chinese: 'จีน',
      thai: 'ไทย',
      vietnamese: 'เวียดนาม',
    },
    learnLanguageOptions: {
      burmese: 'พม่า',
      english: 'อังกฤษ',
      chinese: 'จีน',
      vietnamese: 'เวียดนาม',
      thai: 'ไทย',
    },
    courseFrameworkOptions: {
      cefr: 'CEFR',
      hsk: 'HSK',
    },
    appearanceOptions: {
      light: 'โหมดสว่าง',
      dark: 'โหมดมืด',
    },
    voiceProviderOptions: {
      default: 'ค่าเริ่มต้น',
      apple_siri: 'Apple (Siri)',
    },
  },
  modals: {
    ...APP_TEXT_ENGLISH.modals,
    leaveCompletedUnit: {
      title: 'ทำยูนิตนี้ให้เสร็จก่อน?',
      message: 'คุณได้ 10/10 สำหรับยูนิตนี้แล้ว จะอยู่ต่อหรือออกจากยูนิตนี้?',
      cancelLabel: 'อยู่ในยูนิตนี้',
      confirmLabel: 'ออกจากยูนิต',
    },
  },
};

const APP_TEXT_BY_LANGUAGE: Record<DefaultLanguage, AppTextPack> = {
  english: APP_TEXT_ENGLISH,
  chinese: APP_TEXT_CHINESE,
  thai: APP_TEXT_THAI,
  burmese: {
    navigation: {
      libraryLabel: 'စာကြည့်တိုက်',
      lessonLabel: 'သင်ခန်းစာ',
      profileLabel: 'ပရိုဖိုင်',
      settingsLabel: 'ဆက်တင်များ',
      reloadPageAriaLabel: 'Page ပြန်တင်မယ်',
      closeAriaLabel: 'ပိတ်မယ်',
    },
    appState: {
      loadingLessonsLabel: 'သင်ခန်းစာများ ဖတ်နေသည်...',
      lessonsUnavailableTitle: 'သင်ခန်းစာမရနိုင်ပါ',
      lessonsUnavailableDefaultMessage: 'ယခုအချိန်တွင် သင်ခန်းစာများ မရှိသေးပါ။',
      lessonsUnavailableHealthPrefix: 'Backend API ကိုစစ်ပါ',
      lessonsLoadFailedMessage: 'Backend သို့မဟုတ် offline storage မှ သင်ခန်းစာများကို မတင်နိုင်ပါ။',
      completedTitle: 'ယူနစ်အားလုံး အောင်မြင်ပြီး',
      completedMessage: 'အပိုင်းအားလုံးကိုပြီးမြောက်ပြီး စစ်ဆေးမှုများကို အောင်မြင်ပါတယ်။',
      completedRestartLabel: 'Unit 1 ကို ပြန်စမယ်',
      unexpectedErrorTitle: 'တစ်ခုခု မှားယွင်းသွားပါသည်',
      unexpectedErrorMessage: 'App တွင် မမျှော်လင့်ထားသော error ဖြစ်ခဲ့သည်။ ပြန်တင်ပြီး ဆက်လုပ်ပါ။',
      reloadLabel: 'ပြန်တင်မယ်',
    },
    logoutModal: {
      title: 'Log out လုပ်မလား?',
      message: 'အကောင့်ကနေထွက်မယ်ဆိုတာ အတည်ပြုပါ။',
      cancelLabel: 'မထွက်တော့ဘူး',
      confirmLabel: 'Log out',
    },
    library: {
      searchLabel: 'Library ကို ရှာမယ်',
      searchPlaceholder: 'Library ကို ရှာမယ်',
      playAllLabel: 'အားလုံးဖတ်',
      noAlbumsMatch: 'ရှာဖွေမှုနှင့် ကိုက်ညီသော album မရှိသေးပါ။',
      removeDownloadedConfirmMessage: 'ဒီ group အတွက် download လုပ်ထားတဲ့ offline lessons ကို ဖျက်မလား?',
      downloadingLabel: 'ဒေါင်းလုဒ်လုပ်နေသည်',
      offlineReadyLabel: 'Offline အဆင်သင့်',
      downloadedLabel: 'ဒေါင်းလုဒ်ပြီး',
      downloadLabel: 'ဒေါင်းလုဒ်',
      openGroupAriaPrefix: 'Group ဖွင့်မယ်',
      completedUnitAriaLabel: 'ပြီးဆုံးယူနစ်',
      openLessonAriaPrefix: 'Lesson ဖွင့်မယ်',
      openLessonTitle: 'Lesson ဖွင့်မယ်',
      backToAlbumsAriaLabel: 'နောက်သို့',
      bookmarkAlbumLabel: 'အယ်လ်ဘမ် မှတ်သားမယ်',
      bookmarkTrackLabel: 'မှတ်သားမယ်',
      unitSingularLabel: 'unit',
      unitPluralLabel: 'units',
      collectionFallbackPrefix: 'စုစည်းမှု',
      untitledSourceLabel: 'ခေါင်းစဉ်မရှိ',
    },
    lesson: {
      revisionReviewTabLabel: 'Review',
      revisionQuizTabLabel: 'Quiz',
      unitPrefix: 'ယူနစ်',
      previousLabel: 'နောက်သို့',
      nextLabel: 'ရှေ့သို့',
      readLabel: 'ဖတ်မယ်',
      stopLabel: 'ရပ်မယ်',
      enableShuffleLabel: 'Shuffle ဖွင့်မယ်',
      disableShuffleLabel: 'Shuffle ပိတ်မယ်',
      enableRepeatAllLabel: 'Repeat all ဖွင့်မယ်',
      enableRepeatOneLabel: 'Repeat one ဖွင့်မယ်',
      disableRepeatLabel: 'Repeat ပိတ်မယ်',
      playAudioAriaPrefix: 'အသံဖွင့်မယ်',
      highlightHintTitle: 'အသံထွက်ကို နားထောင်ရန် နှိပ်ပါ။ နှိပ်ထားပြီး ဆွဲကာ စကားစုကို ရွေးချယ်ပါ။',
      highlightCancelLabel: 'မလုပ်တော့',
      highlightClearLabel: 'ဖျက်မယ်',
      highlightAllLabel: 'အားလုံး',
      highlightSaveLabel: 'သိမ်းမယ်',
      pronunciationSomeMissingHint: 'အသံထွက်အချို့ကို မကြာမီ ထည့်ပေးပါမည်။',
      pronunciationAllMissingHint: 'အသံထွက်ကို မကြာမီ ထည့်ပေးပါမည်။',
      backToLibraryAriaLabel: 'နောက်သို့',
    },
    welcome: {
      title: 'ကြိုဆိုပါတယ်',
      description: 'Local profile တစ်ခုဖန်တီးရန် သင့်နာမည်ထည့်ပါ။',
      usernamePlaceholder: 'Username (space မပါ)',
      usernameWhitespaceError: 'Username တွင် space မပါရပါ။',
      continueLabel: 'ဆက်သွားမယ်',
    },
    profile: {
      accountSectionLabel: 'အကောင့်',
      welcomeBackTitle: 'ပြန်လည်ကြိုဆိုပါတယ်',
      progressStatsSectionLabel: 'တိုးတက်မှု အချက်အလက်',
      currentCourseLabel: 'လက်ရှိသင်တန်း',
      downloadedLessonsLabel: 'မှတ်သားထားသော အယ်လ်ဘမ်',
      downloadedUnitsTracksLabel: 'မှတ်သားထားသော သင်ခန်းစာ',
      courseNotAvailableLabel: 'မရရှိသေးပါ',
      changeDisplayNameSectionLabel: 'ဖော်ပြမည့်နာမည် ပြောင်းမယ်',
      displayNamePlaceholder: 'ဖော်ပြမည့်နာမည် (space မပါ)',
      saveLabel: 'သိမ်းမည်',
      usernameWhitespaceError: 'Username တွင် space မပါရပါ။',
      sessionSectionLabel: 'Session',
      logoutLabel: 'Log out',
      openSettingsAriaLabel: 'Settings ဖွင့်မယ်',
    },
    settings: {
      profileContextLabel: 'Profile',
      settingsTitle: 'Settings',
      preferencesSectionLabel: 'Preferences',
      displaySectionLabel: 'Display',
      audioSectionLabel: 'Audio',
      defaultLanguageLabel: 'မူလဘာသာစကား',
      uiLockLanguageLabel: 'UI Lock',
      learnLanguageLabel: 'လေ့လာမည့်ဘာသာစကား',
      courseFrameworkLabel: 'သင်တန်းစံနစ်',
      appearanceLabel: 'မြင်ကွင်း',
      voiceProviderLabel: 'အသံပံ့ပိုးမှု',
      boldTextLabel: 'စာလုံးအထူ',
      autoScrollLabel: 'Auto Scroll',
      textSizeLabel: 'စာလုံးအရွယ်အစား',
      pronunciationLabel: 'အသံထွက်',
      learningLanguageVisibilityLabel: 'လေ့လာဘာသာပြ',
      translationVisibilityLabel: 'ဘာသာပြန်',
      backToProfileAriaLabel: 'Profile သို့ ပြန်မယ်',
      backToSettingsAriaLabel: 'Settings သို့ ပြန်မယ်',
      decreaseTextSizeAriaLabel: 'စာလုံးအရွယ်အစား လျှော့မယ်',
      increaseTextSizeAriaLabel: 'စာလုံးအရွယ်အစား တိုးမယ်',
      onLabel: 'ဖွင့်',
      offLabel: 'ပိတ်',
      defaultLanguageOptions: {
        burmese: 'မြန်မာ',
        english: 'အင်္ဂလိပ်',
        chinese: 'တရုတ်',
        thai: 'ထိုင်း',
        vietnamese: 'ဗီယက်နမ်',
      },
      uiLockLanguageOptions: {
        off: 'ပိတ်',
        burmese: 'မြန်မာ',
        english: 'အင်္ဂလိပ်',
        chinese: 'တရုတ်',
        thai: 'ထိုင်း',
        vietnamese: 'ဗီယက်နမ်',
      },
      learnLanguageOptions: {
        burmese: 'မြန်မာ',
        english: 'အင်္ဂလိပ်',
        chinese: 'တရုတ်',
        vietnamese: 'ဗီယက်နမ်',
        thai: 'ထိုင်း',
      },
      courseFrameworkOptions: {
        cefr: 'CEFR',
        hsk: 'HSK',
      },
      appearanceOptions: {
        light: 'အလင်း',
        dark: 'အမှောင်',
      },
      voiceProviderOptions: {
        default: 'မူလ',
        apple_siri: 'Apple (Siri)',
      },
    },
    modals: {
      leaveCompletedUnit: {
        title: 'ဒီယူနစ်ကို အရင်ပြီးပါ',
        message: 'ဒီယူနစ် 10/10 ပြီးထားပါတယ်။ ဒီယူနစ်မှာ ဆက်မလား၊ တခြားယူနစ်သို့ ပြောင်းမလား?',
        cancelLabel: 'ဒီယူနစ်မှာ ဆက်မယ်',
        confirmLabel: 'ယူနစ်ပြောင်းမယ်',
      },
    },
  },
  vietnamese: {
    navigation: {
      libraryLabel: 'Thư viện',
      lessonLabel: 'Bài học',
      profileLabel: 'Hồ sơ',
      settingsLabel: 'Cài đặt',
      reloadPageAriaLabel: 'Tải lại trang',
      closeAriaLabel: 'Đóng',
    },
    appState: {
      loadingLessonsLabel: 'Đang tải bài học...',
      lessonsUnavailableTitle: 'Không có bài học',
      lessonsUnavailableDefaultMessage: 'Hiện không có bài học nào.',
      lessonsUnavailableHealthPrefix: 'Kiểm tra backend API tại',
      lessonsLoadFailedMessage: 'Không thể tải bài học từ backend hoặc bộ nhớ offline.',
      completedTitle: 'Đã hoàn thành tất cả bài',
      completedMessage: 'Bạn đã hoàn thành mọi phần và vượt qua các kiểm tra ngẫu nhiên.',
      completedRestartLabel: 'Bắt đầu lại Bài 1',
      unexpectedErrorTitle: 'Đã xảy ra lỗi',
      unexpectedErrorMessage: 'Ứng dụng gặp lỗi không mong muốn. Hãy tải lại để khôi phục.',
      reloadLabel: 'Tải lại',
    },
    logoutModal: {
      title: 'Đăng xuất?',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi hồ sơ này không?',
      cancelLabel: 'Hủy',
      confirmLabel: 'Đăng xuất',
    },
    library: {
      searchLabel: 'Tìm kiếm thư viện',
      searchPlaceholder: 'Tìm kiếm thư viện',
      playAllLabel: 'Đọc tất cả',
      noAlbumsMatch: 'Không có album phù hợp với tìm kiếm của bạn.',
      removeDownloadedConfirmMessage: 'Xóa các bài học offline đã tải của nhóm này?',
      downloadingLabel: 'Đang tải',
      offlineReadyLabel: 'Sẵn sàng offline',
      downloadedLabel: 'Đã tải',
      downloadLabel: 'Tải xuống',
      openGroupAriaPrefix: 'Mở nhóm',
      completedUnitAriaLabel: 'Bài đã hoàn thành',
      openLessonAriaPrefix: 'Mở bài',
      openLessonTitle: 'Mở bài',
      backToAlbumsAriaLabel: 'Quay lại',
      bookmarkAlbumLabel: 'Đánh dấu album',
      bookmarkTrackLabel: 'Đánh dấu',
      unitSingularLabel: 'bài',
      unitPluralLabel: 'bài',
      collectionFallbackPrefix: 'Bộ',
      untitledSourceLabel: 'Chưa đặt tên',
    },
    lesson: {
      revisionReviewTabLabel: 'Review',
      revisionQuizTabLabel: 'Quiz',
      unitPrefix: 'Bài',
      previousLabel: 'Trước',
      nextLabel: 'Tiếp',
      readLabel: 'Đọc',
      stopLabel: 'Dừng',
      enableShuffleLabel: 'Bật trộn',
      disableShuffleLabel: 'Tắt trộn',
      enableRepeatAllLabel: 'Bật lặp tất cả',
      enableRepeatOneLabel: 'Bật lặp một',
      disableRepeatLabel: 'Tắt lặp',
      playAudioAriaPrefix: 'Phát âm thanh cho',
      highlightHintTitle: 'Chạm để nghe phát âm. Chạm giữ rồi kéo để tô sáng cụm từ.',
      highlightCancelLabel: 'Hủy',
      highlightClearLabel: 'Xóa',
      highlightAllLabel: 'Tất cả',
      highlightSaveLabel: 'Lưu',
      pronunciationSomeMissingHint: 'Một số phần phát âm sẽ sớm có.',
      pronunciationAllMissingHint: 'Phát âm sẽ sớm có.',
      backToLibraryAriaLabel: 'Quay lại',
    },
    welcome: {
      title: 'Chào mừng',
      description: 'Nhập tên của bạn để tạo hồ sơ cục bộ.',
      usernamePlaceholder: 'Tên người dùng (không có khoảng trắng)',
      usernameWhitespaceError: 'Tên người dùng không được chứa khoảng trắng.',
      continueLabel: 'Tiếp tục',
    },
    profile: {
      accountSectionLabel: 'Tài khoản',
      welcomeBackTitle: 'Chào mừng quay lại',
      progressStatsSectionLabel: 'Thống kê tiến độ',
      currentCourseLabel: 'Khóa học hiện tại',
      downloadedLessonsLabel: 'Album đã đánh dấu',
      downloadedUnitsTracksLabel: 'Bài học đã đánh dấu',
      courseNotAvailableLabel: 'Chưa có',
      changeDisplayNameSectionLabel: 'Đổi tên hiển thị',
      displayNamePlaceholder: 'Tên hiển thị (không có khoảng trắng)',
      saveLabel: 'Lưu',
      usernameWhitespaceError: 'Tên người dùng không được chứa khoảng trắng.',
      sessionSectionLabel: 'Phiên',
      logoutLabel: 'Đăng xuất',
      openSettingsAriaLabel: 'Mở cài đặt',
    },
    settings: {
      profileContextLabel: 'Hồ sơ',
      settingsTitle: 'Cài đặt',
      preferencesSectionLabel: 'Tùy chọn',
      displaySectionLabel: 'Hiển thị',
      audioSectionLabel: 'Âm thanh',
      defaultLanguageLabel: 'Ngôn ngữ mặc định',
      uiLockLanguageLabel: 'Khóa giao diện',
      learnLanguageLabel: 'Ngôn ngữ học',
      courseFrameworkLabel: 'Khung khóa học',
      appearanceLabel: 'Giao diện',
      voiceProviderLabel: 'Nhà cung cấp giọng nói',
      boldTextLabel: 'Chữ đậm',
      autoScrollLabel: 'Tự cuộn',
      textSizeLabel: 'Cỡ chữ',
      pronunciationLabel: 'Phát âm',
      learningLanguageVisibilityLabel: 'Hiện ngôn ngữ học',
      translationVisibilityLabel: 'Bản dịch',
      backToProfileAriaLabel: 'Quay lại hồ sơ',
      backToSettingsAriaLabel: 'Quay lại cài đặt',
      decreaseTextSizeAriaLabel: 'Giảm cỡ chữ',
      increaseTextSizeAriaLabel: 'Tăng cỡ chữ',
      onLabel: 'Bật',
      offLabel: 'Tắt',
      defaultLanguageOptions: {
        burmese: 'Tiếng Miến Điện',
        english: 'Tiếng Anh',
        chinese: 'Tiếng Trung',
        thai: 'Tiếng Thái',
        vietnamese: 'Tiếng Việt',
      },
      uiLockLanguageOptions: {
        off: 'Tắt',
        burmese: 'Tiếng Miến Điện',
        english: 'Tiếng Anh',
        chinese: 'Tiếng Trung',
        thai: 'Tiếng Thái',
        vietnamese: 'Tiếng Việt',
      },
      learnLanguageOptions: {
        burmese: 'Tiếng Miến Điện',
        english: 'Tiếng Anh',
        chinese: 'Tiếng Trung',
        vietnamese: 'Tiếng Việt',
        thai: 'Tiếng Thái',
      },
      courseFrameworkOptions: {
        cefr: 'CEFR',
        hsk: 'HSK',
      },
      appearanceOptions: {
        light: 'Sáng',
        dark: 'Tối',
      },
      voiceProviderOptions: {
        default: 'Mặc định',
        apple_siri: 'Apple (Siri)',
      },
    },
    modals: {
      leaveCompletedUnit: {
        title: 'Hoàn thành bài học này trước?',
        message: 'Bạn đã đạt 10/10 cho bài học này. Ở lại bài học này hay chuyển sang bài học khác?',
        cancelLabel: 'Ở lại bài học này',
        confirmLabel: 'Rời bài học',
      },
    },
  },
};

export function getAppText(defaultLanguage: DefaultLanguage): AppTextPack {
  return APP_TEXT_BY_LANGUAGE[defaultLanguage] || APP_TEXT_ENGLISH;
}

