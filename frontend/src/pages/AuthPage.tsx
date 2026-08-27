import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/app/store/authStore';
import { apiClient } from '@/shared/api';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Bot, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';

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
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Avtorizatsiyada xatolik yuz berdi';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md bg-surface border border-surface-border rounded-3xl p-8 shadow-2xl z-10">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/30 mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            WEN AI
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Universal Sun'iy Intellekt Platformasi
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-surface-dark p-1 border border-surface-border mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isLogin
                ? 'bg-surface-light text-white shadow-sm border border-surface-border'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isLogin
                ? 'bg-surface-light text-white shadow-sm border border-surface-border'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <Input
              label="To'liq Ismingiz"
              placeholder="Ali Valiyev"
              icon={<UserIcon className="w-4 h-4" />}
              {...register('name', { required: "Ism kiritish majburiy" })}
            />
          )}

          <Input
            label="Email Pochta"
            type="email"
            placeholder="ali@example.com"
            icon={<Mail className="w-4 h-4" />}
            {...register('email', { required: "Email kiritish majburiy" })}
          />

          <Input
            label="Maxfiy Kalit (Parol)"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            {...register('password', { required: "Parol kiritish majburiy" })}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            {isLogin ? "Tizimga Kirish" : "Hisob Yaratish"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-primary-light" />
            Xavfsiz JWT va Argon2 shifrlash
          </p>
        </div>
      </div>
    </div>
  );
};
