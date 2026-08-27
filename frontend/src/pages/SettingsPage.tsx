import React, { useState } from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useAuthStore } from '@/app/store/authStore';
import { apiClient } from '@/shared/api';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Cpu,
  Trash2,
  Download,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'account' | 'data'>('general');
  const [name, setName] = useState(user?.name || '');
  const [defaultModel, setDefaultModel] = useState(user?.default_model || 'gpt-4o-mini');
  const [temperature, setTemperature] = useState(user?.temperature || '0.7');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async () => {
    try {
      const res = await apiClient.patch('/users/me', {
        name,
        default_model: defaultModel,
        temperature,
      });
      updateUser(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert("Sozlamalarni saqlashda xatolik yuz berdi.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    try {
      await apiClient.post('/users/me/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordMsg("Parol muvaffaqiyatli o'zgartirildi!");
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg(err.response?.data?.detail || "Parolni o'zgartirishda xatolik");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="border-b border-surface-border/60 pb-6">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-primary-light" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Tizim Sozlamalari
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Profil, AI modellari parametrlari va hisob xavfsizligini boshqaring.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-2xl bg-surface p-1 border border-surface-border gap-1">
            <TabBtn
              label="Umumiy"
              active={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
            />
            <TabBtn
              label="AI Parametrlari"
              active={activeTab === 'ai'}
              onClick={() => setActiveTab('ai')}
            />
            <TabBtn
              label="Hisob & Xavfsizlik"
              active={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
            />
            <TabBtn
              label="Ma'lumotlar"
              active={activeTab === 'data'}
              onClick={() => setActiveTab('data')}
            />
          </div>

          {/* Tab 1: General */}
          {activeTab === 'general' && (
            <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-6">
              <h3 className="text-base font-semibold text-white">
                Foydalanuvchi Profili
              </h3>
              <div className="space-y-4 max-w-md">
                <Input
                  label="Ism va Familiya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email Pochta"
                  value={user?.email || ''}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center gap-3">
                <Button onClick={handleSaveProfile}>
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Saqlandi!</span>
                    </>
                  ) : (
                    'O\'zgarishlarni Saqlash'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: AI Settings */}
          {activeTab === 'ai' && (
            <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-6">
              <h3 className="text-base font-semibold text-white">
                Sun'iy Intellekt Parametrlari
              </h3>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Birlamchi AI Modeli
                  </label>
                  <select
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-primary"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Google)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
                    <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet (Anthropic)</option>
                    <option value="wen-core-default">WEN AI Core (Built-in)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Harorat (Temperature: {temperature})</span>
                    <span className="text-zinc-400 text-[11px]">
                      {parseFloat(temperature) < 0.4 ? 'Aniq & Qat\'iy' : parseFloat(temperature) > 0.8 ? 'Kreativ' : 'Muvozanatli'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border">
                <Button onClick={handleSaveProfile}>
                  {saveSuccess ? 'Saqlandi!' : 'Parametrlarni Saqlash'}
                </Button>
              </div>
            </div>
          )}

          {/* Tab 3: Account & Security */}
          {activeTab === 'account' && (
            <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-6">
              <h3 className="text-base font-semibold text-white">
                Maxfiylik va Parolni O'zgartirish
              </h3>

              {passwordMsg && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-xs">
                  {passwordMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <Input
                  label="Joriy Parol"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Input
                  label="Yangi Parol"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Button type="submit">
                  Parolni Yangilash
                </Button>
              </form>
            </div>
          )}

          {/* Tab 4: Data */}
          {activeTab === 'data' && (
            <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-6">
              <h3 className="text-base font-semibold text-white">
                Ma'lumotlar Boshqaruvi
              </h3>

              <div className="space-y-4 max-w-lg">
                <div className="p-4 rounded-2xl bg-surface-dark border border-surface-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      Ma'lumotlarni Eksport Qilish
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Barcha chatlar va fayllar tarixini JSON formatida yuklab olish.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => alert("Eksport fayli tayyorlanmoqda...")}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Yuklab Olish</span>
                  </Button>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-red-400">
                      Tizimdan Chiqish
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Ushbu qurilmadagi faol sessiyani yakunlash.
                    </p>
                  </div>
                  <Button size="sm" variant="danger" onClick={logout}>
                    Chiqish
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const TabBtn: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
      active
        ? 'bg-surface-light text-white shadow-sm border border-surface-border'
        : 'text-zinc-400 hover:text-white'
    }`}
  >
    {label}
  </button>
);
