import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/app/store/chatStore';
import { ChevronDown, Check } from 'lucide-react';

interface AIModelOption {
  id: string;
  name: string;
  subtitle: string;
  isNew?: boolean;
  isExtended?: boolean;
}

export const AI_MODELS: AIModelOption[] = [
  {
    id: 'wen-3.5-flash-lite',
    name: '3.5 Flash-Lite',
    subtitle: 'Самые быстрые ответы',
  },
  {
    id: 'wen-3.6-flash',
    name: '3.6 Flash',
    subtitle: 'Универсальная модель',
    isNew: true,
  },
  {
    id: 'wen-3.1-pro',
    name: '3.1 Pro',
    subtitle: 'Глубокие рассуждения',
  },
  {
    id: 'wen-extended-thinking',
    name: 'Extended thinking',
    subtitle: 'Решение сложных задач',
    isExtended: true,
  },
];

export const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default to '3.6 Flash' if not set
  useEffect(() => {
    if (!selectedModel || selectedModel === 'gpt-4o-mini') {
      setSelectedModel('wen-3.6-flash');
    }
  }, [selectedModel, setSelectedModel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeModelObj =
    AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[1]; // default 3.6 Flash

  const regularModels = AI_MODELS.filter((m) => !m.isExtended);
  const extendedModel = AI_MODELS.find((m) => m.isExtended);

  const handleSelect = (e: React.MouseEvent, modelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedModel(modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface hover:bg-surface-light border border-surface-border text-xs font-bold text-zinc-200 transition-all hover:border-primary/40 shadow-sm group select-none cursor-pointer"
      >
        <span className="text-white font-semibold">{activeModelObj.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
      </button>

      {/* Model Dropdown Popup matching exact user screenshot */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#18181b]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50 select-none animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-1">
            {regularModels.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={(e) => handleSelect(e, m.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.08] text-white'
                      : 'hover:bg-white/[0.05] text-zinc-300'
                  }`}
                >
                  {/* Checkmark slot on left */}
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {m.name}
                      </span>
                      {m.isNew && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/[0.08]">
                          Новинка
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      {m.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Separator line */}
            <div className="my-1 border-t border-white/[0.08]" />

            {/* Extended thinking item */}
            {extendedModel && (
              <button
                type="button"
                onClick={(e) => handleSelect(e, extendedModel.id)}
                className={`w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  selectedModel === extendedModel.id
                    ? 'bg-white/[0.08] text-white'
                    : 'hover:bg-white/[0.05] text-zinc-300'
                }`}
              >
                {/* Checkmark slot on left */}
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {selectedModel === extendedModel.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white truncate block">
                    {extendedModel.name}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                    {extendedModel.subtitle}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
