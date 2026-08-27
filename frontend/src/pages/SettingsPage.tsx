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
  Zap,
  Sliders,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'account' | 'data'>('general');
  const [name, setName] = useState(user?.name || '');
  const [defaultModel, setDefaultModel] = useState(user?.default_model || 'wen-3.6-flash');
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
      alert("Ошибка при сохранении настроек.");
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
      setPasswordMsg("Пароль успешно изменен!");
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg(err.response?.data?.detail || "Ошибка при изменении пароля");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="border-b border-surface-border pb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary-light">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Настройки системы
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Управление профилем, параметрами моделей искусственного интеллекта и безопасностью аккаунта.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-2xl bg-surface/80 p-1.5 border border-surface-border gap-1.5 backdrop-blur-md">
            <TabBtn
              label="Общие"
              active={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
            />
            <TabBtn
              label="Параметры ИИ"
              active={activeTab === 'ai'}
              onClick={() => setActiveTab('ai')}
            />
            <TabBtn
              label="Безопасность"
              active={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
            />
            <TabBtn
              label="Данные"
              active={activeTab === 'data'}
              onClick={() => setActiveTab('data')}
            />
          </div>

          {/* Tab 1: General */}
          {activeTab === 'general' && (
            <div className="p-8 rounded-3xl bg-surface/70 border border-surface-borderLight space-y-6 shadow-xl backdrop-blur-md">
              <h3 className="text-base font-bold text-white">
                Профиль пользователя
              </h3>
              <div className="space-y-4 max-w-md">
                <Input
                  label="Имя и Фамилия"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Электронная почта"
                  value={user?.email || ''}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center gap-3">
                <Button onClick={handleSaveProfile} className="py-2.5 px-6 rounded-xl font-bold">
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Сохранено!</span>
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: AI Settings */}
          {activeTab === 'ai' && (
            <div className="p-8 rounded-3xl bg-surface/70 border border-surface-borderLight space-y-6 shadow-xl backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary-light" />
                <span>Параметры ИИ</span>
              </h3>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Основная модель ИИ
                  </label>
                  <select
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border rounded-2xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="wen-3.6-flash">3.6 Flash (All-around help)</option>
                    <option value="wen-3.5-flash-lite">3.5 Flash-Lite (Fastest answers)</option>
                    <option value="wen-3.1-pro">3.1 Pro (Advanced reasoning)</option>
                    <option value="wen-extended-thinking">Extended thinking (Deep problem solving)</option>
                  </select>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-surface-dark/60 border border-surface-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-200 font-semibold">Температура (Temperature: {temperature})</span>
                    <span className="text-primary-light font-bold">
                      {parseFloat(temperature) < 0.4 ? 'Точный & Строгий' : parseFloat(temperature) > 0.8 ? 'Креативный' : 'Сбалансированный'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full accent-primary h-2 bg-surface-light rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-zinc-400">
                    Низкая температура дает более детерминированные и точные ответы, высокая — способствует креативности.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border">
                <Button onClick={handleSaveProfile} className="py-2.5 px-6 rounded-xl font-bold">
                  {saveSuccess ? 'Сохранено!' : 'Сохранить параметры'}
                </Button>
              </div>
            </div>
          )}

          {/* Tab 3: Account & Security */}
          {activeTab === 'account' && (
            <div className="p-8 rounded-3xl bg-surface/70 border border-surface-borderLight space-y-6 shadow-xl backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Безопасность и смена пароля</span>
              </h3>

              {passwordMsg && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold">
                  {passwordMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <Input
                  label="Текущий пароль"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Input
                  label="Новый пароль"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Button type="submit" className="py-2.5 px-6 rounded-xl font-bold">
                  Обновить пароль
                </Button>
              </form>
            </div>
          )}

          {/* Tab 4: Data */}
          {activeTab === 'data' && (
            <div className="p-8 rounded-3xl bg-surface/70 border border-surface-borderLight space-y-6 shadow-xl backdrop-blur-md">
              <h3 className="text-base font-bold text-white">
                Управление данными
              </h3>

              <div className="space-y-4 max-w-lg">
                <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Экспорт данных
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Скачать всю историю чатов и метаданные в формате JSON.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-xl"
                    onClick={() => alert("Экспорт подготавливается...")}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать</span>
                  </Button>
                </div>

                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-red-400">
                      Выход из системы
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Завершить текущую активную сессию на этом устройстве.
                    </p>
                  </div>
                  <Button size="sm" variant="danger" className="rounded-xl" onClick={logout}>
                    Выйти
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
    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
      active
        ? 'bg-surface-light text-white shadow-md border border-surface-borderLight'
        : 'text-zinc-400 hover:text-white'
    }`}
  >
    {label}
  </button>
);
