import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { SystemPrompt } from '@/types';
import {
  Terminal,
  Plus,
  Trash2,
  Edit2,
  MessageSquare,
  Code,
  BookCheck,
  Languages,
  Briefcase,
  Layers,
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    name: 'Senior Fullstack Архитектор',
    category: 'coding',
    description: 'Чистый код, лучшие практики, паттерны проектирования и безопасность.',
    content: 'Ты — Senior Fullstack Architect мирового уровня. Отвечай подробно, предоставляй чистый, надежный, масштабируемый код с соблюдением принципов SOLID и Clean Architecture.',
  },
  {
    name: 'Эксперт по переводу и редактуре',
    category: 'writing',
    description: 'Художественный и технический перевод высочайшего качества.',
    content: 'Ты — профессиональный лингвист и редактор. Переводи тексты максимально естественно, точно передавая терминологию, стиль и эмоциональный тон оригинала.',
  },
  {
    name: 'Финансовый и бизнес-аналитик',
    category: 'business',
    description: 'Анализ рынков, финансовые модели, ROI и бизнес-стратегии.',
    content: 'Ты — ведущий финансовый и бизнес-аналитик. Оценивай риски, предлагай эффективные стратегии масштабирования и формируй четкие бизнес-выводы.',
  },
  {
    name: 'SMM & Контент-криейтор',
    category: 'marketing',
    description: 'Вирусные посты, рекламные заголовки и вовлекающий контент.',
    content: 'Ты — эксперт по маркетингу и виральному контенту. Создавай цепляющие, современные и конвертящие тексты для социальных сетей и рекламных кампаний.',
  },
];

export const PromptsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedPromptId } = useChatStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: 'general',
  });

  // Fetch prompts
  const { data: prompts = [], isLoading } = useQuery<SystemPrompt[]>({
    queryKey: ['prompts'],
    queryFn: async () => {
      const res = await apiClient.get('/prompts');
      return res.data;
    },
  });

  // Create or Update
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPrompt) {
        await apiClient.put(`/prompts/${editingPrompt.id}`, data);
      } else {
        await apiClient.post('/prompts', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      handleCloseModal();
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });

  const handleOpenModal = (prompt?: SystemPrompt) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        name: prompt.name,
        description: prompt.description || '',
        content: prompt.content,
        category: prompt.category || 'general',
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        name: '',
        description: '',
        content: '',
        category: 'general',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPrompt(null);
  };

  const handleAddPreset = (preset: any) => {
    createMutation.mutate({
      name: preset.name,
      description: preset.description,
      content: preset.content,
      category: preset.category,
      is_public: false,
    });
  };

  const filteredPrompts = selectedCategory === 'all'
    ? prompts
    : prompts.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose">
                  <Terminal className="w-5 h-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Библиотека системных промптов
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Настраивайте персоны ИИ, роли экспертов и системные инструкции для точных ответов в один клик.
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenModal()}
              className="self-start sm:self-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-xs font-bold shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              <span>СОЗДАТЬ ПРОМПТ</span>
            </Button>
          </div>

          {/* Preset templates */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary-light" />
              <span>Готовые шаблоны (добавление в 1 клик)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-surface/70 border border-surface-borderLight hover:border-primary/40 transition-all flex items-start justify-between gap-4 shadow-lg backdrop-blur-md"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {tmpl.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-snug">{tmpl.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary-light hover:bg-primary/20 text-xs flex-shrink-0 rounded-xl"
                    onClick={() => handleAddPreset(tmpl)}
                  >
                    + Добавить
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* User's Prompts Grid */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-light" />
                <span>Ваши промпты ({filteredPrompts.length})</span>
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-zinc-500 animate-pulse">
                Загрузка...
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="p-10 bg-surface/60 rounded-3xl border border-surface-border text-center text-xs text-zinc-400">
                У вас пока нет сохраненных промптов. Добавьте готовый шаблон выше или создайте новый.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrompts.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl bg-surface/70 border border-surface-borderLight hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-lg bg-primary/15 text-primary-light border border-primary/30">
                          {p.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-2.5">
                          {p.name}
                        </h4>
                        {p.description && (
                          <p className="text-xs text-zinc-400 mt-1 leading-snug">
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-light"
                          title="Редактировать"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(p.id)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-surface-light"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-surface-dark/70 rounded-2xl border border-surface-border/50 text-xs text-zinc-300 font-mono line-clamp-3 leading-relaxed">
                      {p.content}
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs py-2.5 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary shadow-md"
                      onClick={() => {
                        setSelectedPromptId(p.id);
                        navigate('/chat');
                      }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Использовать в чате</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal: Create/Edit prompt */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingPrompt ? "Редактирование промпта" : "Создание новой ИИ-инструкции"}
        >
          <div className="space-y-4">
            <Input
              label="Название промпта"
              placeholder="Например: Senior React Developer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Краткое описание"
              placeholder="Например: Чистый код и лучшие практики разработки"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Системная инструкция (System Instruction)
              </label>
              <textarea
                rows={6}
                placeholder="Введите точные системные правила и указания для ИИ..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-surface-dark border border-surface-border rounded-2xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary resize-none font-mono leading-relaxed"
              />
            </div>

            <Button
              className="w-full py-3 rounded-2xl font-bold"
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name.trim() || !formData.content.trim()}
              isLoading={createMutation.isPending}
            >
              Сохранить
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};
