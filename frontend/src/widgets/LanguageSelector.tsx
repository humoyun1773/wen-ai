import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  greeting: string;
  subtitle: string;
  placeholder: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (Default)',
    flag: '🇬🇧',
    greeting: 'Good day',
    subtitle: 'How can I help you today?',
    placeholder: 'Ask WEN AI anything or enter a prompt...',
  },
  {
    code: 'uz',
    name: 'Uzbek',
    nativeName: 'O‘zbek tili',
    flag: '🇺🇿',
    greeting: 'Xayrli kun',
    subtitle: 'Sizga bugun qanday yordam bera olaman?',
    placeholder: 'WEN AI ga savol bering yoki topshiriq yozing...',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский язык',
    flag: '🇷🇺',
    greeting: 'Добрый день',
    subtitle: 'Чем я могу помочь вам сегодня?',
    placeholder: 'Задайте вопрос WEN AI или напишите запрос...',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    greeting: 'مرحبًا',
    subtitle: 'كيف يمكنني مساعدتك اليوم؟',
    placeholder: 'اسأل WEN AI أي شيء...',
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    greeting: 'İyi günler',
    subtitle: 'Bugün size nasıl yardımcı olabilirim?',
    placeholder: 'WEN AI\'ye bir şey sorun veya bir komut yazın...',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    greeting: 'Guten Tag',
    subtitle: 'Wie kann ich Ihnen heute helfen?',
    placeholder: 'Fragen Sie WEN AI etwas...',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    greeting: 'Bonjour',
    subtitle: 'Comment puis-je vous aider aujourd\'hui ?',
    placeholder: 'Posez une question à WEN AI...',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    greeting: 'Buenos días',
    subtitle: '¿En qué puedo ayudarte hoy?',
    placeholder: 'Pregúntale cualquier cosa a WEN AI...',
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    greeting: 'Buongiorno',
    subtitle: 'Come posso aiutarti oggi?',
    placeholder: 'Chiedi a WEN AI...',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文 (Chinese)',
    flag: '🇨🇳',
    greeting: '你好',
    subtitle: '今天我能为您做些什么？',
    placeholder: '向 WEN AI 提问...',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    greeting: 'こんにちは',
    subtitle: '今日はどのようなご用件でしょうか？',
    placeholder: 'WEN AI に質問を入力してください...',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    greeting: '안녕하세요',
    subtitle: '오늘 무엇을 도와드릴까요?',
    placeholder: 'WEN AI에게 질문하세요...',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    greeting: 'नमस्ते',
    subtitle: 'आज मैं आपकी क्या मदद कर सकता हूँ?',
    placeholder: 'WEN AI से कुछ भी पूछें...',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    greeting: 'Bom dia',
    subtitle: 'Como posso ajudar você hoje?',
    placeholder: 'Pergunte qualquer coisa ao WEN AI...',
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    greeting: 'Dzień dobry',
    subtitle: 'W czym mogę Ci dzisiaj pomóc?',
    placeholder: 'Zapytaj WEN AI o cokolwiek...',
  },
  {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    greeting: 'Доброго дня',
    subtitle: 'Чим я можу вам допомогти сьогодні?',
    placeholder: 'Запитайте що завгодно у WEN AI...',
  },
  {
    code: 'kk',
    name: 'Kazakh',
    nativeName: 'Қазақ тілі',
    flag: '🇰🇿',
    greeting: 'Қайырлы күн',
    subtitle: 'Бүгін сізге қалай көмектесе аламын?',
    placeholder: 'WEN AI-ға сұрақ қойыңыз...',
  },
  {
    code: 'ky',
    name: 'Kyrgyz',
    nativeName: 'Кыргыз тили',
    flag: '🇰🇬',
    greeting: 'Кутман күн',
    subtitle: 'Бүгүн сизге кандай жардам бере алам?',
    placeholder: 'WEN AIга суроо бериңиз...',
  },
  {
    code: 'tk',
    name: 'Turkmen',
    nativeName: 'Türkmen dili',
    flag: '🇹🇲',
    greeting: 'Ertiriňiz haýyrly',
    subtitle: 'Şu gün size nähili kömek edip bilerin?',
    placeholder: 'WEN AI-dan sorag soraň...',
  },
  {
    code: 'tg',
    name: 'Tajik',
    nativeName: 'Тоҷикӣ',
    flag: '🇹🇯',
    greeting: 'Рӯзи хуш',
    subtitle: 'Имрӯз ба шумо чӣ гуна кӯмак карда метавонам?',
    placeholder: 'Аз WEN AI савол пурсед...',
  },
];

interface LanguageSelectorProps {
  currentLang: string;
  onSelectLang: (langCode: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelectLang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-surface-border hover:border-primary/50 text-xs font-semibold text-zinc-200 transition-all hover:bg-surface-light shadow-sm"
        title="Tilni tanlash / Select Language"
      >
        <span className="text-sm">{selected.flag}</span>
        <span className="hidden sm:inline font-medium">{selected.name}</span>
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface-dark/95 backdrop-blur-2xl border border-surface-borderLight rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-between border-b border-surface-border/60">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-primary-light" />
              20 Ta Rasmiy Til
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary-light">
              Avtomatik
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 pt-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onSelectLang(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-left text-xs transition-all ${
                  currentLang === lang.code
                    ? 'bg-primary/20 text-white font-bold border border-primary/40'
                    : 'text-zinc-300 hover:bg-surface hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{lang.flag}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs">{lang.nativeName}</p>
                    <p className="text-[10px] text-zinc-500">{lang.name}</p>
                  </div>
                </div>
                {currentLang === lang.code && (
                  <Check className="w-3.5 h-3.5 text-primary-light" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
