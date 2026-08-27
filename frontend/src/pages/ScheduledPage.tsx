import React, { useState } from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import {
  Clock,
  Plus,
  Play,
  CheckCircle,
  Pause,
  Trash2,
  Calendar,
  Zap,
} from 'lucide-react';

interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  model: string;
  prompt: string;
  isActive: boolean;
  lastRun?: string;
}

const SAMPLE_JOBS: ScheduledJob[] = [
  {
    id: '1',
    name: 'Ежедневный дайджест новостей технологий и ИИ',
    schedule: 'Каждый день в 09:00',
    model: 'wen-3.6-flash',
    prompt: 'Сформируй краткий дайджест из 5 главных технологических новостей за сутки.',
    isActive: true,
    lastRun: 'Сегодня в 09:00',
  },
  {
    id: '2',
    name: 'Еженедельный аудит кодовой базы и безопасности',
    schedule: 'Каждый понедельник в 10:00',
    model: 'wen-3.1-pro',
    prompt: 'Проанализируй коммиты за неделю и выдели потенциальные уязвимости.',
    isActive: false,
    lastRun: '25 августа',
  },
];

export const ScheduledPage: React.FC = () => {
  const [jobs, setJobs] = useState<ScheduledJob[]>(SAMPLE_JOBS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    schedule: 'Каждый день в 09:00',
    model: 'wen-3.6-flash',
    prompt: '',
  });

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.prompt.trim()) return;
    const newJob: ScheduledJob = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
      lastRun: 'Запланировано',
    };
    setJobs([newJob, ...jobs]);
    setIsModalOpen(false);
    setFormData({ name: '', schedule: 'Каждый день в 09:00', model: 'wen-3.6-flash', prompt: '' });
  };

  const toggleJob = (id: string) => {
    setJobs(
      jobs.map((j) => (j.id === id ? { ...j, isActive: !j.isActive } : j))
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 md:p-10 relative">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-accent-emerald to-secondary text-white shadow-lg shadow-emerald-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Запланированные задачи (Scheduled)
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Автоматизация ИИ: периодические задачи, мониторинг и регулярные уведомления.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-xs font-bold shadow-lg shadow-primary/25 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>ДОБАВИТЬ ЗАДАЧУ</span>
            </Button>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-3xl bg-surface/75 border border-surface-borderLight hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-md"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
                        job.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-surface-border'
                      }`}
                    >
                      {job.isActive ? 'Активно' : 'Приостановлено'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-primary-light" />
                      {job.schedule}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white truncate">{job.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono line-clamp-1 italic bg-surface-dark/50 p-2 rounded-xl">
                    "{job.prompt}"
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={job.isActive ? 'secondary' : 'primary'}
                    className="text-xs rounded-xl"
                    onClick={() => toggleJob(job.id)}
                  >
                    {job.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{job.isActive ? 'Приостановить' : 'Запустить'}</span>
                  </Button>

                  <button
                    onClick={() => setJobs(jobs.filter((j) => j.id !== job.id))}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-surface-light rounded-xl transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Новая запланированная задача"
        >
          <div className="space-y-4">
            <Input
              label="Название задачи"
              placeholder="Например: Утренний дайджест"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Периодичность запуска
              </label>
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full bg-surface-dark border border-surface-border rounded-2xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-primary"
              >
                <option value="Каждый день в 09:00">Каждый день в 09:00</option>
                <option value="Каждый день в 18:00">Каждый день в 18:00</option>
                <option value="Каждый понедельник в 10:00">Каждый понедельник в 10:00</option>
                <option value="Каждые 2 часа">Каждые 2 часа</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Инструкция для ИИ (Промпт)
              </label>
              <textarea
                rows={4}
                placeholder="Опишите задачу, которую ИИ должен выполнять по расписанию..."
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                className="w-full bg-surface-dark border border-surface-border rounded-2xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <Button onClick={handleCreate} className="w-full py-3 rounded-2xl font-bold">
              Запланировать
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};
