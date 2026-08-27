import React, { useEffect, useState } from 'react';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { ModelInfo } from '@/types';
import { Sparkles, ChevronDown, Cpu } from 'lucide-react';

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
        // Fallback default list
        setModels([
          {
            id: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            provider: 'OpenAI',
            context_window: 128000,
            description: 'Fast & capable',
            is_available: true,
          },
          {
            id: 'gemini-1.5-flash',
            name: 'Gemini 1.5 Flash',
            provider: 'Google',
            context_window: 1000000,
            description: '1M context ultra fast',
            is_available: true,
          },
          {
            id: 'wen-core-default',
            name: 'WEN AI Core',
            provider: 'Built-in',
            context_window: 32000,
            description: 'Local engine',
            is_available: true,
          },
        ]);
      }
    };
    fetchModels();
  }, []);

  const activeModelObj = models.find((m) => m.id === selectedModel) || {
    name: selectedModel || 'Select Model',
    provider: 'AI',
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-light/60 hover:bg-surface-light border border-surface-border text-xs font-medium text-zinc-200 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-primary-light" />
        <span>{activeModelObj.name}</span>
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-surface border border-surface-border rounded-2xl shadow-2xl p-2 z-30 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-surface-border">
              Mavjud AI Modellar
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors ${
                    selectedModel === m.id
                      ? 'bg-primary/15 border border-primary/30 text-white'
                      : 'hover:bg-surface-light text-zinc-300'
                  }`}
                >
                  <Cpu className="w-4 h-4 mt-0.5 text-primary-light flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold truncate text-zinc-100">
                        {m.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-dark text-zinc-400 border border-surface-border">
                        {m.provider}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {m.description}
                    </p>
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
