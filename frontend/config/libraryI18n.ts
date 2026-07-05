import { DefaultLanguage, StageCode } from './appConfig';

export type LibraryTextPack = {
  library: string;
  unitPrefix: string;
  groupPrefix: string;
  stageLabels: Record<StageCode, string>;
};

type KnownLevelScheme = 'cefr' | 'hsk' | 'jlpt' | 'custom';

const LIBRARY_TEXT_ENGLISH: LibraryTextPack = {
  library: 'Library',
  unitPrefix: 'Unit',
  groupPrefix: 'Units',
  stageLabels: {
    A1: 'Beginner (A1)',
    A2: 'Pre-Intermediate (A2)',
    B1: 'Intermediate (B1)',
    B2: 'Upper-Intermediate (B2)',
  },
};

const LIBRARY_TEXT_BY_LANGUAGE: Record<string, LibraryTextPack> = {
  english: LIBRARY_TEXT_ENGLISH,
  burmese: {
    library: 'စာကြည့်တိုက်',
    unitPrefix: 'ယူနစ်',
    groupPrefix: 'ယူနစ်များ',
    stageLabels: {
      A1: 'အခြေခံ (A1)',
      A2: 'အခြေခံအလယ်တန်း (A2)',
      B1: 'အလယ်တန်း (B1)',
      B2: 'အလယ်တန်းမြင့် (B2)',
    },
  },
  vietnamese: {
    library: 'Thư viện',
    unitPrefix: 'Bài',
    groupPrefix: 'Các bài',
    stageLabels: {
      A1: 'Sơ cấp (A1)',
      A2: 'Tiền trung cấp (A2)',
      B1: 'Trung cấp (B1)',
      B2: 'Trung cấp cao (B2)',
    },
  },
};

const LIBRARY_TOPIC_REPLACEMENTS_BY_LANGUAGE: Record<string, Record<string, string>> = {
  burmese: {
    'common phrases for beginners': 'အခြေခံ အသုံးများသော စကားစုများ',
    'alphabet sounds & basic pronunciation': 'အက္ခရာအသံများနှင့် အခြေခံအသံထွက်',
    'greeting and introducing yourself': 'နှုတ်ဆက်ခြင်းနှင့် မိမိကိုယ်ကို မိတ်ဆက်ခြင်း',
    'saying name, country, job': 'နာမည်၊ နိုင်ငံ၊ အလုပ် ပြောခြင်း',
    'yes/no short answers': 'ဟုတ်/မဟုတ် အတိုချုံးဖြေဆိုမှုများ',
    'classroom survival phrases': 'စာသင်ခန်း အသုံးဝင် စကားစုများ',
    'talking about daily routine': 'နေ့စဉ်လုပ်ရိုးလုပ်စဉ်အကြောင်း ပြောခြင်း',
    'describing people & objects': 'လူများနှင့် အရာဝတ္ထုများကို ဖော်ပြခြင်း',
    'asking simple questions': 'ရိုးရှင်းသော မေးခွန်းများ မေးခြင်း',
    'talking about time & dates': 'အချိန်နှင့် ရက်စွဲအကြောင်း ပြောခြင်း',
    'giving simple directions': 'ရိုးရှင်းသော လမ်းညွှန်ချက်များ ပေးခြင်း',
    'talking about likes & preferences': 'ကြိုက်နှစ်သက်မှုနှင့် ရွေးချယ်မှုအကြောင်း ပြောခြင်း',
    'talking about family & friends': 'မိသားစုနှင့် သူငယ်ချင်းများအကြောင်း ပြောခြင်း',
    'talking about past weekend': 'ပြီးခဲ့သည့် စနေတနင်္ဂနွေအကြောင်း ပြောခြင်း',
    'talking about future plans': 'အနာဂတ် အစီအစဉ်များအကြောင်း ပြောခြင်း',
    'role-play conversations': 'သရုပ်ဆောင် စကားပြောလေ့ကျင့်မှု',
    'selling and buying': 'ရောင်းခြင်းနှင့် ဝယ်ခြင်း',
    'price and quantity': 'စျေးနှုန်းနှင့် အရေအတွက်',
    'payment and discount': 'ငွေပေးချေမှုနှင့် လျှော့စျေး',
    'return and exchange': 'ပြန်အပ်ခြင်းနှင့် လဲလှယ်ခြင်း',
    'market conversation': 'စျေးကွက် စကားပြော',
    'telling past stories': 'အတိတ်ဖြစ်ရပ်များ ပြောပြခြင်း',
    'describing experiences': 'အတွေ့အကြုံများ ဖော်ပြခြင်း',
    'sequencing events clearly': 'ဖြစ်ရပ်များကို အစဉ်လိုက် ပြတ်သားစွာ ပြောခြင်း',
    'comparing things': 'အရာများကို နှိုင်းယှဉ်ခြင်း',
    'giving short explanations': 'အတိုချုံး ရှင်းလင်းချက်များ ပေးခြင်း',
    'making requests politely': 'ယဉ်ကျေးစွာ တောင်းဆိုခြင်း',
    'giving advice': 'အကြံပေးခြင်း',
    'making suggestions': 'အကြံပြုခြင်း',
    'handling simple problems': 'ရိုးရှင်းသော ပြဿနာများ ကိုင်တွယ်ခြင်း',
    'expressing agreement/disagreement': 'သဘောတူ/မတူ ကို ဖော်ပြခြင်း',
    'giving opinions with reasons': 'အကြောင်းပြချက်နှင့် အမြင်ပေးခြင်း',
    'explaining cause & effect': 'အကြောင်းရင်းနှင့် အကျိုးဆက် ရှင်းပြခြင်း',
    'describing advantages & disadvantages': 'အားသာချက်နှင့် အားနည်းချက် ဖော်ပြခြင်း',
    'reacting naturally in conversation': 'စကားဝိုင်းတွင် သဘာဝကျစွာ တုံ့ပြန်ခြင်း',
    'extending answers confidently': 'ယုံကြည်မှုရှိစွာ ဖြေချက်ကို တိုးချဲ့ခြင်း',
    'talking about achievements': 'အောင်မြင်မှုများအကြောင်း ပြောခြင်း',
    'describing processes': 'လုပ်ငန်းစဉ်များ ဖော်ပြခြင်း',
    'hypothetical situations (if...)': 'ဖြစ်နိုင်ချေ အခြေအနေများ (if...)',
    'explaining decisions': 'ဆုံးဖြတ်ချက်များ ရှင်းပြခြင်း',
    'storytelling techniques': 'ဇာတ်လမ်းပြော နည်းစနစ်များ',
    'expressing strong opinions': 'တင်းကျပ်သော အမြင်များ ဖော်ပြခြင်း',
    'supporting arguments': 'အငြင်းအခုံများကို ထောက်ခံခြင်း',
    'comparing viewpoints': 'အမြင်များကို နှိုင်းယှဉ်ခြင်း',
    'participating in discussions': 'ဆွေးနွေးပွဲများတွင် ပါဝင်ခြင်း',
    'managing turn-taking': 'အလှည့်ကျ ပြောဆိုမှု ကို စီမံခြင်း',
    'presenting arguments': 'အကြောင်းပြချက်များ တင်ပြခြင်း',
    'convincing others': 'အခြားသူများကို ယုံကြည်လာအောင် ပြောဆိုခြင်း',
    'handling objections': 'ကန့်ကွက်ချက်များ ကိုင်တွယ်ခြင်း',
    'structured mini-presentations': 'ဖွဲ့စည်းထားသော အတိုတင်ပြမှုများ',
    'debate practice': 'အငြင်းပွား စကားပြော လေ့ကျင့်မှု',
    'hypothetical & abstract topics': 'ဖြစ်နိုင်ချေ နှင့် အယူအဆဆိုင်ရာ အကြောင်းအရာများ',
    'nuanced comparisons': 'အသေးစိတ်ကွာခြားချက်ပါ နှိုင်းယှဉ်မှုများ',
    'clarifying complex ideas': 'ရှုပ်ထွေးသော အယူအဆများ ရှင်းလင်းခြင်း',
    'paraphrasing smoothly': 'အဓိပ္ပါယ်တူ ပြန်လည်ဖော်ပြခြင်းကို ချောမွေ့စွာ ပြုလုပ်ခြင်း',
    'emphasis & rhetorical devices': 'အလေးပေးဖော်ပြမှုနှင့် ဟောပြောနည်းကိရိယာများ',
    'analyzing social issues': 'လူမှုရေး ပြဿနာများ ခွဲခြမ်းစိတ်ဖြာခြင်း',
    'evaluating arguments': 'အငြင်းအခုံများ အကဲဖြတ်ခြင်း',
    'diplomatic disagreement': 'သံတမန်ဆန်သော သဘောမတူခြင်း',
    'problem-solution discussions': 'ပြဿနာ-ဖြေရှင်းနည်း ဆွေးနွေးမှုများ',
    'critical thinking in speech': 'ပြောဆိုရာတွင် ဝေဖန်စဉ်းစားနိုင်မှု',
    'leading meetings': 'အစည်းအဝေး ဦးဆောင်ခြင်း',
    'formal presentations': 'တရားဝင် တင်ပြမှုများ',
    'negotiation techniques': 'ဆွေးနွေးညှိနှိုင်း နည်းစနစ်များ',
    'handling q&a sessions': 'မေးခွန်း-ဖြေကြား အစီအစဉ်များ ကိုင်တွယ်ခြင်း',
    'executive-level communication': 'အုပ်ချုပ်မှုအဆင့် ဆက်သွယ်ပြောဆိုမှု',
    'burmese words': 'မြန်မာ စကားလုံးများ',
    'english words': 'အင်္ဂလိပ် စကားလုံးများ',
    'chinese words': 'တရုတ် စကားလုံးများ',
  },
};

const LIBRARY_TOPIC_CONCISE_BY_LANGUAGE: Record<string, Record<string, string>> = {
  english: {
    'common phrases for beginners': 'Common Phrases',
    'alphabet sounds & basic pronunciation': 'Pronunciation',
    'greeting and introducing yourself': 'Greetings',
    'saying name, country, job': 'Name & Intro',
    'yes/no short answers': 'Yes/No',
    'classroom survival phrases': 'Classroom',
    'talking about daily routine': 'Daily Routine',
    'describing people & objects': 'People & Objects',
    'asking simple questions': 'Simple Questions',
    'talking about time & dates': 'Time & Dates',
    'giving simple directions': 'Directions',
    'talking about likes & preferences': 'Likes',
    'talking about family & friends': 'Family & Friends',
    'talking about past weekend': 'Past Weekend',
    'talking about future plans': 'Future Plans',
    'role-play conversations': 'Role-play',
    'selling and buying': 'Buy & Sell',
    'price and quantity': 'Price & Qty',
    'payment and discount': 'Payment',
    'return and exchange': 'Returns',
    'market conversation': 'Market Talk',
    'telling past stories': 'Past Stories',
    'describing experiences': 'Experiences',
    'sequencing events clearly': 'Event Sequence',
    'comparing things': 'Comparisons',
    'giving short explanations': 'Explanations',
    'making requests politely': 'Polite Requests',
    'giving advice': 'Advice',
    'making suggestions': 'Suggestions',
    'handling simple problems': 'Problem Solving',
    'expressing agreement/disagreement': 'Agree/Disagree',
    'giving opinions with reasons': 'Opinions',
    'explaining cause & effect': 'Cause & Effect',
    'describing advantages & disadvantages': 'Pros & Cons',
    'reacting naturally in conversation': 'Natural Reactions',
    'extending answers confidently': 'Extended Answers',
    'talking about achievements': 'Achievements',
    'describing processes': 'Processes',
    'hypothetical situations (if...)': 'If Situations',
    'explaining decisions': 'Decisions',
    'storytelling techniques': 'Storytelling',
    'expressing strong opinions': 'Strong Opinions',
    'supporting arguments': 'Support Arguments',
    'comparing viewpoints': 'Viewpoints',
    'participating in discussions': 'Discussions',
    'managing turn-taking': 'Turn-taking',
    'presenting arguments': 'Present Arguments',
    'convincing others': 'Persuasion',
    'handling objections': 'Objections',
    'structured mini-presentations': 'Mini Presentations',
    'debate practice': 'Debate',
    'hypothetical & abstract topics': 'Abstract Topics',
    'nuanced comparisons': 'Nuanced Compare',
    'clarifying complex ideas': 'Clarify Ideas',
    'paraphrasing smoothly': 'Paraphrasing',
    'emphasis & rhetorical devices': 'Emphasis Skills',
    'analyzing social issues': 'Social Analysis',
    'evaluating arguments': 'Evaluate Arguments',
    'diplomatic disagreement': 'Diplomatic Talk',
    'problem-solution discussions': 'Problem-Solution',
    'critical thinking in speech': 'Critical Thinking',
    'leading meetings': 'Lead Meetings',
    'formal presentations': 'Formal Presenting',
    'negotiation techniques': 'Negotiation',
    'handling q&a sessions': 'Q&A Handling',
    'executive-level communication': 'Executive Comms',
  },
  burmese: {
    'common phrases for beginners': 'အခြေခံစကားစု',
    'alphabet sounds & basic pronunciation': 'အသံထွက်',
    'greeting and introducing yourself': 'နှုတ်ဆက်/မိတ်ဆက်',
    'saying name, country, job': 'နာမည်/နိုင်ငံ/အလုပ်',
    'yes/no short answers': 'ဟုတ်/မဟုတ်',
    'classroom survival phrases': 'စာသင်ခန်း',
    'talking about daily routine': 'နေ့စဉ်လုပ်ရိုး',
    'describing people & objects': 'လူ/အရာဖော်ပြ',
    'asking simple questions': 'မေးခွန်းများ',
    'talking about time & dates': 'အချိန်/ရက်စွဲ',
    'giving simple directions': 'လမ်းညွှန်',
    'talking about likes & preferences': 'ကြိုက်နှစ်သက်မှု',
    'talking about family & friends': 'မိသားစု/သူငယ်ချင်း',
    'talking about past weekend': 'ပြီးခဲ့သော ပိတ်ရက်',
    'talking about future plans': 'အနာဂတ်အစီအစဉ်',
    'role-play conversations': 'သရုပ်ဆောင်စကား',
    'selling and buying': 'ရောင်း/ဝယ်',
    'price and quantity': 'စျေးနှုန်း/အရေအတွက်',
    'payment and discount': 'ငွေပေး/လျှော့စျေး',
    'return and exchange': 'ပြန်အပ်/လဲလှယ်',
    'market conversation': 'စျေးကွက်စကား',
    'telling past stories': 'အတိတ်ဇာတ်လမ်း',
    'describing experiences': 'အတွေ့အကြုံဖော်ပြ',
    'sequencing events clearly': 'အစဉ်လိုက်ဖြစ်ရပ်',
    'comparing things': 'နှိုင်းယှဉ်မှု',
    'giving short explanations': 'အတိုရှင်းလင်း',
    'making requests politely': 'ယဉ်ကျေးတောင်းဆို',
    'giving advice': 'အကြံပေး',
    'making suggestions': 'အကြံပြု',
    'handling simple problems': 'ပြဿနာဖြေရှင်း',
    'expressing agreement/disagreement': 'သဘောတူ/မတူ',
    'giving opinions with reasons': 'အမြင်/အကြောင်း',
    'explaining cause & effect': 'အကြောင်း/အကျိုး',
    'describing advantages & disadvantages': 'အားသာ/အားနည်း',
    'reacting naturally in conversation': 'သဘာဝတုံ့ပြန်',
    'extending answers confidently': 'ယုံကြည်ဖြေဆို',
    'talking about achievements': 'အောင်မြင်မှု',
    'describing processes': 'လုပ်ငန်းစဉ်ဖော်ပြ',
    'hypothetical situations (if...)': 'if အခြေအနေ',
    'explaining decisions': 'ဆုံးဖြတ်ချက်',
    'storytelling techniques': 'ဇာတ်လမ်းနည်း',
    'expressing strong opinions': 'တင်းကျပ်အမြင်',
    'supporting arguments': 'အငြင်းအခုံထောက်ခံ',
    'comparing viewpoints': 'အမြင်နှိုင်းယှဉ်',
    'participating in discussions': 'ဆွေးနွေးမှု',
    'managing turn-taking': 'အလှည့်ကျပြော',
    'presenting arguments': 'အကြောင်းပြတင်ပြ',
    'convincing others': 'ယုံကြည်စေခြင်း',
    'handling objections': 'ကန့်ကွက်ဖြေရှင်း',
    'structured mini-presentations': 'အတိုတင်ပြ',
    'debate practice': 'အငြင်းပွားလေ့ကျင့်',
    'hypothetical & abstract topics': 'အယူအဆဆိုင်ရာ',
    'nuanced comparisons': 'အသေးစိတ်နှိုင်းယှဉ်',
    'clarifying complex ideas': 'ရှုပ်ထွေးအယူအဆ',
    'paraphrasing smoothly': 'အဓိပ္ပါယ်တူဖော်ပြ',
    'emphasis & rhetorical devices': 'အလေးပေးနည်း',
    'analyzing social issues': 'လူမှုရေးခွဲခြမ်း',
    'evaluating arguments': 'အငြင်းအခုံအကဲ',
    'diplomatic disagreement': 'သံတမန်သဘောမတူ',
    'problem-solution discussions': 'ပြဿနာ-ဖြေရှင်း',
    'critical thinking in speech': 'ဝေဖန်စဉ်းစား',
    'leading meetings': 'အစည်းအဝေးဦးဆောင်',
    'formal presentations': 'တရားဝင်တင်ပြ',
    'negotiation techniques': 'ညှိနှိုင်းနည်း',
    'handling q&a sessions': 'Q&A ကိုင်တွယ်',
    'executive-level communication': 'အုပ်ချုပ်မှုဆက်သွယ်',
  },
};

export function getLibraryText(defaultLanguage: DefaultLanguage): LibraryTextPack {
  return LIBRARY_TEXT_BY_LANGUAGE[defaultLanguage] || LIBRARY_TEXT_ENGLISH;
}

function normalizeLevelScheme(value: string | undefined): KnownLevelScheme {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'cefr' || normalized === 'hsk' || normalized === 'jlpt') return normalized;
  return 'custom';
}

function normalizeLevelCode(value: string | undefined): string {
  return String(value || '').trim().toUpperCase();
}

export function localizeCollectionLabel(
  label: string,
  defaultLanguage: DefaultLanguage,
  levelScheme?: string,
  levelCode?: string,
): string {
  const scheme = normalizeLevelScheme(levelScheme);
  const code = normalizeLevelCode(levelCode);
  if (scheme === 'cefr') {
    if (code === 'A1' || code === 'A2' || code === 'B1' || code === 'B2') {
      return getLibraryText(defaultLanguage).stageLabels[code];
    }
    return label;
  }

  if (scheme === 'hsk') {
    const match = code.match(/^HSK\s*([1-9]\d*)$/i) || label.match(/^HSK\s*([1-9]\d*)$/i);
    if (!match) return label;
    return `HSK ${match[1]}`;
  }

  if (scheme === 'jlpt') {
    const match = code.match(/^N([1-5])$/i) || label.match(/^N([1-5])$/i);
    if (!match) return label;
    return `JLPT N${match[1]}`;
  }

  return label;
}

export function localizeLibraryTopic(topic: string, defaultLanguage: DefaultLanguage): string {
  const replacements = LIBRARY_TOPIC_REPLACEMENTS_BY_LANGUAGE[defaultLanguage];
  if (!replacements) return topic;

  let localized = topic;
  for (const [source, target] of Object.entries(replacements)) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    localized = localized.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), target);
  }
  return localized;
}

export function localizeLibraryTopicConcise(topic: string, defaultLanguage: DefaultLanguage): string {
  const normalized = topic.trim().toLowerCase();
  const conciseMap = LIBRARY_TOPIC_CONCISE_BY_LANGUAGE[defaultLanguage];
  if (conciseMap?.[normalized]) return conciseMap[normalized];
  return localizeLibraryTopic(topic, defaultLanguage);
}

