import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { apiClient } from '@/shared/api';
import { SystemPrompt } from '@/types';
import { useChatStore } from '@/app/store/chatStore';
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
  Bot,
  Sliders,
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    name: 'Senior Frontend & React Developer',
    description: 'Clean TypeScript, Tailwind CSS va zamonaviy arxitektura',
    content: 'You are an expert Senior Frontend Architect. Provide clean, modular, and typed React 18+ code with Tailwind CSS. Explain design patterns and prioritize high performance and UX.',
    category: 'coding',
  },
  {
    name: 'Senior Python & FastAPI Architect',
    description: 'Clean Architecture, async SQLAlchemy va Pydantic v2',
    content: 'You are an elite Python Backend Architect. Write production-ready, clean architecture FastAPI code using async SQLAlchemy 2.0, Pydantic v2, robust error handling and structured logging.',
    category: 'coding',
  },
  {
    name: 'O\'zbek Tili Tahrirchisi va Muallif',
    description: 'Rasmiy va professional tilda matn yaratish',
    content: 'Siz professional o\'zbek tili muharriri va filolog mutaxassisisiz. Barcha matnlarni imlo qoidalariga qat\'iy amal qilgan holda, chiroyli va rasmiy uslubda tahrirlang.',
    category: 'writing',
  },
  {
    name: 'Shartnoma va Huquqiy Hujjat Auditor',
    description: 'Hujjatlardagi xavflar va majburiyatlarni tekshirish',
    content: 'You are a meticulous Legal and Contract Analyst. Analyze documents for legal compliance, risks, liability issues, and unclear clauses. Point out critical red flags clearly.',
    category: 'business',
  },
];

export const PromptsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedPromptId } = useChatStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: 'custom',
  });

  // Fetch prompts
  const { data: prompts = [], isLoading } = useQuery<SystemPrompt[]>({
    queryKey: ['prompts'],
    queryFn: async () => {
      const res = await apiClient.get('/prompts');
      return res.data;
    },
  });

  // Create/Update prompt
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPrompt) {
        await apiClient.patch(`/prompts/${editingPrompt.id}`, data);
      } else {
        await apiClient.post('/prompts', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      handleCloseModal();
    },
  });

  // Delete prompt
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });

  const handleOpenModal = (p?: SystemPrompt) => {
    if (p) {
      setEditingPrompt(p);
      setFormData({
        name: p.name,
        description: p.description || '',
        content: p.content,
        category: p.category || 'custom',
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        name: '',
        description: '',
        content: '',
        category: 'custom',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPrompt(null);
  };

  const handleAddPreset = async (preset: typeof PRESET_TEMPLATES[0]) => {
    await apiClient.post('/prompts', preset);
    queryClient.invalidateQueries({ queryKey: ['prompts'] });
  };

  const filteredPrompts = prompts.filter((p) => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose">
                  <Terminal className="w-5 h-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  System Prompts & AI Personalar
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                AI ga maxsus rollar, shaxsiyatlar va xulq-atvor qoidalarini biriktiring va suhbat kontekstini o'zgartiring.
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenModal()}
              className="self-start sm:self-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-xs font-bold shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              <span>YANGI PROMPT YARATISH</span>
            </Button>
          </div>

          {/* Preset templates */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary-light" />
              <span>Tayyor Shablonlar (1-bosishda qo'shish)</span>
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
                    + Qo'shish
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
                <span>Faol Promplaringiz ({filteredPrompts.length})</span>
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-zinc-500 animate-pulse">
                Yuklanmoqda...
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="p-10 bg-surface/60 rounded-3xl border border-surface-border text-center text-xs text-zinc-400">
                Hozircha shaxsiy promptlar yo'q. Yuqoridagi tayyor shablonlardan birini qo'shing yoki yangi prompt yarating.
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
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(p.id)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-surface-light"
                          title="O'chirish"
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
                      <span>Ushbu Persona bilan Chat qilish</span>
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
          title={editingPrompt ? "Promptni Tahrirlash" : "Yangi AI Ko'rsatma Yaratish"}
        >
          <div className="space-y-4">
            <Input
              label="Prompt Nomi"
              placeholder="Masalan: Senior React Developer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Qisqacha Tavsif"
              placeholder="Masalan: Toza kod va eng yaxshi amaliyotlar"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Tizim Ko'rsatmasi (System Instruction)
              </label>
              <textarea
                rows={6}
                placeholder="AI ga beriladigan aniq ko'rsatmalarni yozing..."
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
              Saqlash
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};
