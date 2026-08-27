import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/app/store/authStore';
import { apiClient } from '@/shared/api';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Bot, Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await apiClient.post('/auth/login', {
          email: data.email,
          password: data.password,
        });
        loginToStore(res.data.user, res.data.tokens.access_token, res.data.tokens.refresh_token);
        navigate('/chat');
      } else {
        const res = await apiClient.post('/auth/register', {
          name: data.name,
          email: data.email,
          password: data.password,
        });
        loginToStore(res.data.user, res.data.tokens.access_token, res.data.tokens.refresh_token);
        navigate('/chat');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Ошибка авторизации. Проверьте данные.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent-rose/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-md bg-surface-dark/85 backdrop-blur-2xl border border-surface-borderLight rounded-3xl p-8 md:p-10 shadow-2xl z-10">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              WEN AI
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Универсальная платформа искусственного интеллекта
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-surface p-1.5 border border-surface-border mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              isLogin
                ? 'bg-surface-light text-white shadow-md border border-surface-borderLight'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              !isLogin
                ? 'bg-surface-light text-white shadow-md border border-surface-borderLight'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Регистрация
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <Input
              label="Ваше имя"
              placeholder="Иван Иванов"
              icon={<UserIcon className="w-4 h-4" />}
              {...register('name', { required: "Введите имя" })}
            />
          )}

          <Input
            label="Электронная почта"
            type="email"
            placeholder="user@example.com"
            icon={<Mail className="w-4 h-4" />}
            {...register('email', { required: "Введите email" })}
          />

          <Input
            label="Пароль"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            {...register('password', { required: "Введите пароль" })}
          />

          <Button
            type="submit"
            className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-primary via-primary-hover to-secondary shadow-lg shadow-primary/30 text-xs font-bold tracking-wide"
            isLoading={isLoading}
          >
            <span className="flex items-center justify-center gap-2">
              <span>{isLogin ? "ВОЙТИ В СИСТЕМУ" : "СОЗДАТЬ АККАУНТ"}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-surface-border flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Защита Argon2 & JWT
          </span>
          <span>v1.0.0 Production</span>
        </div>
      </div>
    </div>
  );
};
