import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Bot,
  Users,
  Building,
  ArrowRight,
} from 'lucide-react';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<'personal' | 'business'>('personal');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-6xl bg-[#0d0d12] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl my-auto text-zinc-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-surface-dark border border-surface-border text-zinc-400 hover:text-white hover:bg-surface-light transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Tarif rejangizni yangilang
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            O'zingiz yoki jamoangiz uchun eng mos sun'iy intellekt rejasini tanlang
          </p>

          {/* Plan Tab Switcher */}
          <div className="inline-flex rounded-2xl bg-surface-dark p-1 border border-surface-border mt-3">
            <button
              onClick={() => setTab('personal')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'personal'
                  ? 'bg-surface-light text-white shadow-md border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Shaxsiy tariflar
            </button>
            <button
              onClick={() => setTab('business')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'business'
                  ? 'bg-surface-light text-white shadow-md border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Biznes & Jamoa
            </button>
          </div>
        </div>

        {/* Tab 1: Personal Plans */}
        {tab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Free */}
            <div className="p-6 rounded-3xl bg-surface/50 border border-surface-border flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Free
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    WEN AI ni sinab ko'ring
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Kundalik savollar va oddiy vazifalar uchun bepul AI.
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-xs text-zinc-500 font-medium">/ oy</span>
                </div>

                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-surface-dark border border-surface-border text-xs font-semibold text-zinc-400 cursor-default"
                >
                  Joriy rejangiz
                </button>

                <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-zinc-300">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Asosiy imkoniyatlar:
                  </p>
                  <FeatureItem text="Cheklangan chat so'rovlari" />
                  <FeatureItem text="Asosiy GPT-4o mini modeli" />
                  <FeatureItem text="1 ta fayl tahlili (RAG)" />
                  <FeatureItem text="Standart javob tezligi" />
                </div>
              </div>
            </div>

            {/* WEN Go */}
            <div className="p-6 rounded-3xl bg-surface/60 border border-surface-border hover:border-primary/40 flex flex-col justify-between space-y-6 transition-all">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-light">
                    WEN Go
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    Ko'proq foydalaning
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    O'qish, yaratish va kattaroq limitlar bilan ishlash.
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$5</span>
                  <span className="text-xs text-zinc-500 font-medium">/ oy</span>
                </div>

                <button
                  onClick={() => alert("WEN Go rejasiga o'tish tanlandi")}
                  className="w-full py-2.5 rounded-xl bg-surface-light hover:bg-white hover:text-black border border-white/10 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                >
                  Go ga o'tish
                </button>

                <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-zinc-300">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Free dagi barcha imkoniyatlar va:
                  </p>
                  <FeatureItem text="Kengaytirilgan chat limiti" />
                  <FeatureItem text="AI rasm yaratish (Vision studio)" />
                  <FeatureItem text="Ovozli yozish va eshitish" />
                  <FeatureItem text="Tezlashtirilgan server kuchi" />
                </div>
              </div>
            </div>

            {/* WEN Plus (RECOMMENDED / HIGHLIGHTED) */}
            <div className="relative p-6 rounded-3xl bg-gradient-to-b from-primary/20 via-surface to-surface-dark border-2 border-primary/60 flex flex-col justify-between space-y-6 shadow-2xl shadow-primary/20 scale-105 z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                TAVSIYA ETILADI
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-light flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    WEN Plus
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    Sizning to'liq AI assistentingiz
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Eng kuchli flagman modellar va cheksiz tahlil.
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$20</span>
                  <span className="text-xs text-zinc-500 font-medium">/ oy</span>
                </div>

                <button
                  onClick={() => alert("WEN Plus rejasiga o'tish tanlandi")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-primary-hover to-secondary hover:brightness-110 text-xs font-black text-white tracking-wide transition-all shadow-lg shadow-primary/30 active:scale-95"
                >
                  WEN Plus ga o'tish
                </button>

                <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-zinc-200">
                  <p className="text-[10px] font-bold text-primary-light uppercase tracking-wider">
                    Go dagi barcha imkoniyatlar va:
                  </p>
                  <FeatureItem text="GPT-4o & Claude 3.5 Sonnet to'liq" highlight />
                  <FeatureItem text="Document AI & RAG (PDF, DOCX, CSV)" highlight />
                  <FeatureItem text="WEN Codex — AI Developer Sandbox" highlight />
                  <FeatureItem text="Rejalashtirilgan avtomatizatsiya" />
                  <FeatureItem text="Reklamasiz va maksimal tezlik" />
                </div>
              </div>
            </div>

            {/* WEN Pro */}
            <div className="p-6 rounded-3xl bg-surface/60 border border-surface-border hover:border-secondary/40 flex flex-col justify-between space-y-6 transition-all">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                    WEN Pro
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    Maksimal imkoniyatlar
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Kun bo'yi og'ir dasturlash va hisoblash bilan ishlovchilar uchun.
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$100</span>
                  <span className="text-xs text-zinc-500 font-medium">/ oy</span>
                </div>

                <button
                  onClick={() => alert("WEN Pro rejasiga o'tish tanlandi")}
                  className="w-full py-2.5 rounded-xl bg-surface-light hover:bg-white hover:text-black border border-white/10 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                >
                  Pro ga o'tish
                </button>

                <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-zinc-300">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Plus dagi barcha imkoniyatlar va:
                  </p>
                  <FeatureItem text="5 baravar kattaroq hisoblash quvvati" />
                  <FeatureItem text="100 GB bulutli hujjatlar xotirasi" />
                  <FeatureItem text="Eng yangi beta modellarga erta kirish" />
                  <FeatureItem text="Shaxsiy API integratsiyasi" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Business Plans */}
        {tab === 'business' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-3xl bg-surface/50 border border-surface-border flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Free
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    WEN AI ni jamoada sinash
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Kichik guruhlar uchun boshlang'ich imkoniyatlar.
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-xs text-zinc-500 font-medium">/ oy</span>
                </div>

                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-surface-dark border border-surface-border text-xs font-semibold text-zinc-400 cursor-default"
                >
                  Joriy rejangiz
                </button>

                <div className="space-y-2.5 pt-4 border-t border-surface-border text-xs text-zinc-300">
                  <FeatureItem text="Cheklangan umumiy chat" />
                  <FeatureItem text="Asosiy modellar" />
                  <FeatureItem text="1 ta umumiy workspace" />
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
                      O'sayotgan jamoalar uchun
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                    KORPORATIV
                  </span>
                </div>

                <p className="text-xs text-zinc-400">
                  Kompaniya konteksti va markazlashgan boshqaruv bilan himoyalangan ish maydoni.
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$25</span>
                  <span className="text-xs text-zinc-400 font-medium">
                    / foydalanuvchi / oy
                  </span>
                </div>

                <button
                  onClick={() => alert("WEN Business rejasiga so'rov yuborildi")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-primary hover:brightness-110 text-xs font-black text-white tracking-wide transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  Business ga ulanish
                </button>

                <div className="space-y-2.5 pt-4 border-t border-surface-border text-xs text-zinc-200">
                  <p className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">
                    Jamoaviy imkoniyatlar:
                  </p>
                  <FeatureItem text="Admin paneli va foydalanuvchilar monitoringi" highlight />
                  <FeatureItem text="Kompaniya ichki RAG bilimlar bazasi" highlight />
                  <FeatureItem text="SAML SSO va ikki bosqichli xavfsizlik (MFA)" highlight />
                  <FeatureItem text="Cheksiz GPT-4o, Claude 3.5 va WEN Codex" />
                  <FeatureItem text="Kompaniya ma'lumotlari AI o'qitishda ishlatilmaydi" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-surface-border text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Istalgan vaqtda bekor qilish yoki o'zgartirish mumkin. To'lovlar xavfsiz himoyalangan.</span>
        </div>
      </div>
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
