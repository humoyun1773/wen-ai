import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import {
  Folder,
  Plus,
  MessageSquare,
  FileCode,
  Users,
  MoreVertical,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  chatsCount: number;
  filesCount: number;
  updatedAt: string;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'WEN AI Core Platform',
    description: 'FastAPI Clean Architecture backend va React TypeScript frontend tizimi',
    chatsCount: 14,
    filesCount: 6,
    updatedAt: 'Bugun 17:15',
  },
  {
    id: '2',
    name: 'E-Commerce Microservices',
    description: 'Docker, Redis kesh va PostgreSQL klasterli onlayn do\'kon servislari',
    chatsCount: 8,
    filesCount: 3,
    updatedAt: '24-avgust',
  },
];

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    const newProj: Project = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description || 'Loyiha tavsifi yo\'q',
      chatsCount: 0,
      filesCount: 0,
      updatedAt: 'Hozirgina',
    };
    setProjects([newProj, ...projects]);
    setIsModalOpen(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 md:p-10 relative">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-accent-rose to-primary text-white shadow-lg shadow-rose-500/20">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Loyihalar & Ish Maydonlari (Projects)
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Har bir loyiha uchun alohida chatlar, fayllar va AI ko'rsatmalarini guruhlang.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-xs font-bold shadow-lg shadow-primary/25 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>YANGI LOYIHA OCHISH</span>
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 rounded-3xl bg-surface/75 border border-surface-borderLight hover:border-primary/40 transition-all flex flex-col justify-between space-y-5 shadow-xl backdrop-blur-md hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
                        <Folder className="w-5 h-5 text-primary-light" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {proj.name}
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {proj.updatedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setProjects(projects.filter((p) => p.id !== proj.id))}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-surface-light"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    {proj.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-border text-xs">
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-primary-light" />
                      {proj.chatsCount} ta chat
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-accent-cyan" />
                      {proj.filesCount} ta fayl
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary-light hover:bg-primary/15 text-xs py-1.5 px-3 rounded-xl"
                    onClick={() => navigate('/chat')}
                  >
                    <span>Loyiha Chati</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Yangi Loyiha Yaratish"
        >
          <div className="space-y-4">
            <Input
              label="Loyiha Nomi"
              placeholder="Masalan: AI Platform Backend"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Loyiha Tavsifi
              </label>
              <textarea
                rows={3}
                placeholder="Loyiha maqsadi va texnologiyalari..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-surface-dark border border-surface-border rounded-2xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <Button onClick={handleCreate} className="w-full py-3 rounded-2xl font-bold">
              Yaratish
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};
