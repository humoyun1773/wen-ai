import React, { useEffect, useState } from 'react';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { ModelInfo } from '@/types';
import { Sparkles, ChevronDown, Cpu, Zap, Check } from 'lucide-react';

export const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useChatStore();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await apiClient.get('/models');
        setModels(res.data.models);
      } catch {
        setModels([
          {
            id: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            provider: 'OpenAI',
            context_window: 128000,
            description: 'Fast, intelligent & versatile for daily tasks',
            is_available: true,
          },
          {
            id: 'gpt-4o',
            name: 'GPT-4o',
            provider: 'OpenAI',
            context_window: 128000,
            description: 'Most powerful flagship reasoning and coding model',
            is_available: true,
          },
          {
            id: 'gemini-1.5-flash',
            name: 'Gemini 1.5 Flash',
            provider: 'Google',
            context_window: 1000000,
            description: '1 Million token context window with extreme speed',
            is_available: true,
          },
          {
            id: 'claude-3-5-sonnet-20240620',
            name: 'Claude 3.5 Sonnet',
            provider: 'Anthropic',
            context_window: 200000,
            description: 'Industry-leading code generation & complex problem solving',
            is_available: true,
          },
          {
            id: 'wen-core-default',
            name: 'WEN Core Engine',
            provider: 'WEN Engine',
            context_window: 32000,
            description: 'Zero-config local engine with built-in intelligence',
            is_available: true,
          },
        ]);
      }
    };
    fetchModels();
  }, []);

  const activeModelObj = models.find((m) => m.id === selectedModel) || {
    name: selectedModel || 'Model Tanlang',
    provider: 'AI',
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-light border border-surface-border text-xs font-semibold text-zinc-200 transition-all hover:border-primary/40 shadow-sm group"
      >
        <span className="w-2 h-2 rounded-full bg-primary-neon animate-pulse" />
        <span className="truncate max-w-[130px]">{activeModelObj.name}</span>
        <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-3 w-80 bg-surface-dark/95 backdrop-blur-2xl border border-surface-border rounded-3xl shadow-2xl p-2.5 z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-between border-b border-surface-border/60">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-primary-light" />
                Mavjud AI Modellar
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary-light">
                {models.length} ta
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 pt-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-2xl text-left transition-all ${
                    selectedModel === m.id
                      ? 'bg-primary/20 border border-primary/50 text-white shadow-md shadow-primary/20'
                      : 'hover:bg-surface border border-transparent text-zinc-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedModel === m.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-surface-light text-zinc-400 border border-surface-border'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {m.name}
                      </span>
                      {selectedModel === m.id && (
                        <Check className="w-3.5 h-3.5 text-primary-light" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5 leading-snug">
                      {m.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-zinc-500 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-surface-border text-zinc-400">
                        {m.provider}
                      </span>
                      <span>{(m.context_window / 1000).toFixed(0)}k Context</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
