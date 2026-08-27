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

  // Fetch provider statuses
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

  // Toggle user active status mutation
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
    <div className="flex h-screen w-screen overflow-hidden bg-background text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="border-b border-surface-border/60 pb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Admin Boshqaruv Paneli
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Foydalanuvchilar, AI providerlar va tizim resurslari monitoringi.
            </p>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="w-5 h-5 text-primary-light" />}
              label="Jami Foydalanuvchilar"
              value={stats?.total_users ?? 0}
              subtext={`${stats?.active_users ?? 0} faol hisoblar`}
            />
            <StatCard
              icon={<MessageSquare className="w-5 h-5 text-accent-cyan" />}
              label="Jami Suhbatlar"
              value={stats?.total_conversations ?? 0}
              subtext={`${stats?.total_messages ?? 0} xabarlar`}
            />
            <StatCard
              icon={<FileText className="w-5 h-5 text-accent-pink" />}
              label="Yuklangan Hujjatlar"
              value={stats?.total_files ?? 0}
              subtext="RAG bazasida"
            />
            <StatCard
              icon={<Activity className="w-5 h-5 text-accent-emerald" />}
              label="Sarflangan Tokenlar"
              value={stats?.total_tokens_used ? stats.total_tokens_used.toLocaleString() : '0'}
              subtext={`${stats?.total_requests ?? 0} so'rovlar`}
            />
          </div>

          {/* AI Providers Diagnostic Section */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary-light" />
              <span>AI Providerlar Holati</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-surface border border-surface-border space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      {p.provider_name}
                    </h4>
                    {p.is_configured ? (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Faol
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Kalitsiz
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-zinc-500" />
                      <span className="font-mono text-[11px]">
                        {p.masked_key || 'API Key berilmagan (.env)'}
                      </span>
                    </div>
                    <div className="text-[11px]">
                      Modellar: <span className="text-zinc-200">{p.available_models.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Management Table */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-light" />
                <span>Foydalanuvchilar Ro'yxati</span>
              </h2>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Ism yoki email bo'yicha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-surface border border-surface-border rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-dark border-b border-surface-border text-zinc-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3">Foydalanuvchi</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Rol</th>
                      <th className="px-5 py-3">Holat</th>
                      <th className="px-5 py-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50 text-zinc-300">
                    {isUsersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-6 text-center text-zinc-500">
                          Yuklanmoqda...
                        </td>
                      </tr>
                    ) : userList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-6 text-center text-zinc-500">
                          Foydalanuvchilar topilmadi
                        </td>
                      </tr>
                    ) : (
                      userList.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-light/40 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-white flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
                              {u.name[0].toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-400">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                u.role === 'admin'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-zinc-800 text-zinc-300 border-surface-border'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                u.is_active
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {u.is_active ? 'Faol' : 'Bloklangan'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              size="sm"
                              variant={u.is_active ? 'danger' : 'secondary'}
                              className="text-[11px] py-1 px-2.5"
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
                                  <span>Bloklash</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" />
                                  <span>Faollashtirish</span>
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
}> = ({ icon, label, value, subtext }) => (
  <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
      <div className="p-2 rounded-xl bg-surface-dark border border-surface-border">
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
    <p className="text-[11px] text-zinc-500">{subtext}</p>
  </div>
);
