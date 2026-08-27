import React, { useState } from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import {
  Check,
  Zap,
  ShieldCheck,
  Building,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [tab, setTab] = useState<'personal' | 'business'>('personal');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 md:p-10 relative">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          {/* Title Header */}
          <div className="text-center max-w-xl mx-auto space-y-2 pt-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Обновите свой план
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Выберите оптимальный тарифный план для себя или своей команды
            </p>

            {/* Plan Tab Switcher */}
            <div className="inline-flex rounded-2xl bg-surface p-1 border border-surface-border mt-4">
              <button
                onClick={() => setTab('personal')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'personal'
                    ? 'bg-surface-light text-white shadow-md border border-white/10'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Персональные
              </button>
              <button
                onClick={() => setTab('business')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'business'
                    ? 'bg-surface-light text-white shadow-md border border-white/10'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Бизнес & Команда
              </button>
            </div>
          </div>

          {/* Personal Tab */}
          {tab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {/* Free */}
              <div className="p-6 rounded-3xl bg-surface/60 border border-surface-border flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-md">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Free
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      Попробуйте WEN AI
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      Бесплатный доступ для повседневных задач и простых запросов.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$0</span>
                    <span className="text-xs text-zinc-500 font-medium">/ мес</span>
                  </div>

                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-surface-dark border border-surface-border text-xs font-semibold text-zinc-400 cursor-default"
                  >
                    Текущий план
                  </button>

                  <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-zinc-300">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Включено в план:
                    </p>
                    <FeatureItem text="Базовый лимит сообщений" />
                    <FeatureItem text="Модель GPT-4o mini" />
                    <FeatureItem text="Анализ 1 документа (RAG)" />
                    <FeatureItem text="Стандартная скорость ответа" />
                  </div>
                </div>
              </div>

              {/* WEN Go */}
              <div className="p-6 rounded-3xl bg-surface/60 border border-surface-border hover:border-primary/40 flex flex-col justify-between space-y-6 transition-all shadow-xl backdrop-blur-md">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-light">
                      WEN Go
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      Больше возможностей
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      Для учебы, творчества и работы с повышенными лимитами.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$5</span>
                    <span className="text-xs text-zinc-500 font-medium">/ мес</span>
                  </div>

                  <button
                    onClick={() => alert("Выбран переход на план WEN Go")}
                    className="w-full py-2.5 rounded-xl bg-surface-light hover:bg-white hover:text-black border border-white/10 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    Перейти на Go
                  </button>

                  <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-zinc-300">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Все из Free, плюс:
                    </p>
                    <FeatureItem text="Расширенный лимит сообщений" />
                    <FeatureItem text="Генерация изображений (Vision)" />
                    <FeatureItem text="Голосовой ввод и озвучивание" />
                    <FeatureItem text="Повышенная скорость серверов" />
                  </div>
                </div>
              </div>

              {/* WEN Plus (RECOMMENDED / HIGHLIGHTED) */}
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-primary/20 via-surface to-surface-dark border-2 border-primary/60 flex flex-col justify-between space-y-6 shadow-2xl shadow-primary/20 lg:-translate-y-2 z-10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                  РЕКОМЕНДУЕТСЯ
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-light">
                      WEN Plus
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      Ваш полный ИИ-ассистент
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      Флагманские модели ИИ и безлимитный интеллектуальный анализ.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$20</span>
                    <span className="text-xs text-zinc-500 font-medium">/ мес</span>
                  </div>

                  <button
                    onClick={() => alert("Выбран переход на план WEN Plus")}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-primary-hover to-secondary hover:brightness-110 text-xs font-black text-white tracking-wide transition-all shadow-lg shadow-primary/30 active:scale-95"
                  >
                    Перейти на WEN Plus
                  </button>

                  <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-zinc-200">
                    <p className="text-[10px] font-bold text-primary-light uppercase tracking-wider">
                      Все из Go, плюс:
                    </p>
                    <FeatureItem text="Полный доступ к GPT-4o & Claude 3.5" highlight />
                    <FeatureItem text="Document AI & RAG (PDF, Word, CSV)" highlight />
                    <FeatureItem text="WEN Codex — среда разработки ИИ" highlight />
                    <FeatureItem text="Автоматизация по расписанию" />
                    <FeatureItem text="Максимальная скорость без рекламы" />
                  </div>
                </div>
              </div>

              {/* WEN Pro */}
              <div className="p-6 rounded-3xl bg-surface/60 border border-surface-border hover:border-secondary/40 flex flex-col justify-between space-y-6 transition-all shadow-xl backdrop-blur-md">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                      WEN Pro
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      Максимальная мощность
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      Для профессиональной разработки, анализа данных и вычислений.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$100</span>
                    <span className="text-xs text-zinc-500 font-medium">/ мес</span>
                  </div>

                  <button
                    onClick={() => alert("Выбран переход на план WEN Pro")}
                    className="w-full py-2.5 rounded-xl bg-surface-light hover:bg-white hover:text-black border border-white/10 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    Перейти на Pro
                  </button>

                  <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-zinc-300">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Все из Plus, плюс:
                    </p>
                    <FeatureItem text="В 5 раз больше вычислительных ресурсов" />
                    <FeatureItem text="100 ГБ облачного хранилища документов" />
                    <FeatureItem text="Ранний доступ к новым бета-моделям" />
                    <FeatureItem text="Индивидуальная API интеграция" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {tab === 'business' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
              {/* Free */}
              <div className="p-8 rounded-3xl bg-surface/60 border border-surface-border flex flex-col justify-between space-y-6 shadow-xl">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Free
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Тестирование в команде
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Базовые функции для совместной работы небольших групп.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$0</span>
                    <span className="text-xs text-zinc-500 font-medium">/ мес</span>
                  </div>

                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-surface-dark border border-surface-border text-xs font-semibold text-zinc-400 cursor-default"
                  >
                    Текущий план
                  </button>

                  <div className="space-y-2.5 pt-4 border-t border-surface-border text-xs text-zinc-300">
                    <FeatureItem text="Ограниченный общий чат" />
                    <FeatureItem text="Базовые модели" />
                    <FeatureItem text="1 общее рабочее пространство" />
                  </div>
                </div>
              </div>

              {/* WEN Business */}
              <div className="p-8 rounded-3xl bg-gradient-to-b from-accent-cyan/15 via-surface to-surface-dark border-2 border-accent-cyan/60 flex flex-col justify-between space-y-6 shadow-2xl shadow-cyan-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                        WEN Business
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        Для растущих компаний
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                      КОРПОРАТИВНЫЙ
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400">
                    Защищенная рабочая среда с контекстом компании и централизованным управлением.
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$25</span>
                    <span className="text-xs text-zinc-400 font-medium">
                      / пользователь / мес
                    </span>
                  </div>

                  <button
                    onClick={() => alert("Заявка на подключение WEN Business отправлена")}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-primary hover:brightness-110 text-xs font-black text-white tracking-wide transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                  >
                    Подключить Business
                  </button>

                  <div className="space-y-2.5 pt-4 border-t border-surface-border text-xs text-zinc-200">
                    <p className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">
                      Корпоративные функции:
                    </p>
                    <FeatureItem text="Панель администратора и аудит доступа" highlight />
                    <FeatureItem text="Внутренняя корпоративная база знаний RAG" highlight />
                    <FeatureItem text="SAML SSO и двухфакторная защита (MFA)" highlight />
                    <FeatureItem text="Безлимитный доступ к GPT-4o, Claude 3.5 и WEN Codex" />
                    <FeatureItem text="Данные компании не используются для обучения ИИ" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-6 border-t border-surface-border text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Отмена или смена плана в любое время. Все платежи надежно защищены.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureItem: React.FC<{ text: string; highlight?: boolean }> = ({
  text,
  highlight,
}) => (
  <div className="flex items-center gap-2">
    <Check
      className={`w-3.5 h-3.5 flex-shrink-0 ${
        highlight ? 'text-primary-neon' : 'text-emerald-400'
      }`}
    />
    <span className={highlight ? 'text-zinc-100 font-semibold' : 'text-zinc-300'}>
      {text}
    </span>
  </div>
);
