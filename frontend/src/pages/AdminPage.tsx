import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { apiClient } from '@/shared/api';
import { AdminStats, ProviderStatus, User } from '@/types';
import {
  Shield,
  Users,
  MessageSquare,
  FileText,
  Activity,
  Cpu,
  Search,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Key,
  TrendingUp,
  Server,
  Zap,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats');
      return res.data;
    },
  });

  // Fetch providers
  const { data: providers = [] } = useQuery<ProviderStatus[]>({
    queryKey: ['admin-providers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/providers');
      return res.data;
    },
  });

  // Fetch users
  const { data: userList = [], isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ['admin-users', searchQuery],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users', {
        params: { search: searchQuery || undefined },
      });
      return res.data;
    },
  });

  // Toggle user status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiClient.patch(`/admin/users/${id}`, { is_active: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="border-b border-surface-border pb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Панель администратора
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Мониторинг активности пользователей, состояния провайдеров ИИ и расхода токенов.
            </p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="w-5 h-5 text-primary-light" />}
              label="Всего пользователей"
              value={stats?.total_users ?? 0}
              subtext={`${stats?.active_users ?? 0} активных`}
              badge="+100%"
              color="primary"
            />
            <StatCard
              icon={<MessageSquare className="w-5 h-5 text-accent-cyan" />}
              label="Всего чатов"
              value={stats?.total_conversations ?? 0}
              subtext={`${stats?.total_messages ?? 0} сообщений`}
              badge="Активно"
              color="cyan"
            />
            <StatCard
              icon={<FileText className="w-5 h-5 text-accent-rose" />}
              label="Индексировано файлов"
              value={stats?.total_files ?? 0}
              subtext="В базе RAG"
              badge="Загружено"
              color="rose"
            />
            <StatCard
              icon={<Activity className="w-5 h-5 text-accent-emerald" />}
              label="Использовано токенов"
              value={stats?.total_tokens_used ? stats.total_tokens_used.toLocaleString() : '0'}
              subtext={`${stats?.total_requests ?? 0} запросов`}
              badge="Мониторинг"
              color="emerald"
            />
          </div>

          {/* AI Providers Diagnostic */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-primary-light" />
              <span>Диагностика провайдеров ИИ и API-ключей</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-surface/70 border border-surface-borderLight space-y-3.5 shadow-lg backdrop-blur-md hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary-light" />
                      <h4 className="text-xs font-bold text-white">
                        {p.provider_name}
                      </h4>
                    </div>
                    {p.is_configured ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Активен
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Без ключа
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-400 bg-surface-dark/60 p-3 rounded-2xl border border-surface-border/40">
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <Key className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-300 truncate">
                        {p.masked_key || 'API-ключ не задан (.env)'}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      Модели: <span className="text-zinc-200 font-medium">{p.available_models.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Management Table */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-light" />
                <span>Зарегистрированные пользователи</span>
              </h2>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Поиск по имени или email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface border border-surface-border rounded-2xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="bg-surface/70 rounded-3xl border border-surface-borderLight overflow-hidden shadow-xl backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-dark border-b border-surface-border text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Пользователь</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Роль</th>
                      <th className="px-6 py-4">Статус</th>
                      <th className="px-6 py-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/40 text-zinc-300">
                    {isUsersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 animate-pulse">
                          Загрузка пользователей...
                        </td>
                      </tr>
                    ) : userList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                          Пользователи не найдены
                        </td>
                      </tr>
                    ) : (
                      userList.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-light/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-md">
                              {u.name[0].toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 font-mono text-[11px]">{u.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${
                                u.role === 'admin'
                                   ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-surface-dark text-zinc-400 border-surface-border'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                u.is_active
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {u.is_active ? 'Активен' : 'Заблокирован'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              variant={u.is_active ? 'danger' : 'secondary'}
                              className="text-[11px] py-1.5 px-3 rounded-xl font-semibold"
                              onClick={() =>
                                toggleStatusMutation.mutate({
                                  id: u.id,
                                  isActive: u.is_active,
                                })
                              }
                            >
                              {u.is_active ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>Заблокировать</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" />
                                  <span>Разблокировать</span>
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  badge: string;
  color: 'primary' | 'cyan' | 'rose' | 'emerald';
}> = ({ icon, label, value, subtext, badge }) => (
  <div className="p-6 rounded-3xl bg-surface/70 border border-surface-borderLight space-y-3 shadow-lg backdrop-blur-md hover:-translate-y-0.5 transition-all">
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
      <div className="p-2.5 rounded-2xl bg-surface-dark border border-surface-border">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-black text-white tracking-tight">{value}</div>
    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
      <p className="text-[11px] text-zinc-400">{subtext}</p>
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-300">
        {badge}
      </span>
    </div>
  </div>
);
