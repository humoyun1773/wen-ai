import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/authStore';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { Message } from '@/types';
import { MessageItem } from '@/widgets/MessageItem';
import { ChatInput } from '@/widgets/ChatInput';
import { UpgradePlanModal } from '@/widgets/UpgradePlanModal';
import {
  Menu,
  Sparkles,
  Code2,
  Image as ImageIcon,
  Atom,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

const SUGGESTIONS = [
  {
    id: 'art',
    icon: <ImageIcon className="w-5 h-5 text-pink-400" />,
    title: 'Генерация концепта',
    description: 'Создать 3D концепт интерфейса с неоновым освещением',
    prompt: 'Создай детальное описание и визуальный концепт футуристического 3D интерфейса с темной темой и неоновыми акцентами.',
    badge: 'Vision Studio',
  },
  {
    id: 'code',
    icon: <Code2 className="w-5 h-5 text-violet-400" />,
    title: 'Разработка кода',
    description: 'Архитектура FastAPI с Redis и WebSockets',
    prompt: 'Напиши продакшн-ready бэкенд на Python FastAPI с асинхронным подключением Redis и поддержкой стриминга.',
    badge: 'Code Engine',
  },
  {
    id: 'research',
    icon: <Atom className="w-5 h-5 text-cyan-400" />,
    title: 'Глубокое исследование',
    description: 'Комплексный анализ технологических трендов 2026',
    prompt: 'Проведи глубокое аналитическое исследование прорывных технологий ИИ и агентных систем в 2026 году.',
    badge: 'Deep Research',
  },
  {
    id: 'business',
    icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
    title: 'Бизнес & Стратегия',
    description: 'Пошаговый план запуска AI SaaS продукта',
    prompt: 'Составь подробную стратегию запуска, масштабирования и монетизации AI SaaS стартапа на мировом рынке.',
    badge: 'Growth Pro',
  },
];

export const ChatArea: React.FC = () => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const {
    currentConversationId,
    setCurrentConversationId,
    selectedModel,
    attachedFiles,
    clearAttachedFiles,
    isStreaming,
    setIsStreaming,
    streamingMessage,
    appendStreamingChunk,
    setStreamingMessage,
    resetStreaming,
    toggleSidebar,
  } = useChatStore();

  // Fetch messages if a conversation is active
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const res = await apiClient.get(`/conversations/${currentConversationId}/messages`);
      return res.data;
    },
    enabled: !!currentConversationId,
  });

  // Auto-scroll on new message or stream chunk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSendMessage = async (text: string) => {
    if (isStreaming) return;

    setIsStreaming(true);
    setStreamingMessage('');

    const attachedIds = attachedFiles.map((f) => f.id);
    const token = localStorage.getItem('wen_ai_access_token');

    try {
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          conversation_id: currentConversationId,
          message: text,
          model: selectedModel,
          attached_file_ids: attachedIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to stream response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) throw new Error('No stream reader');

      let doneReading = false;
      let buffer = '';

      while (!doneReading) {
        const { value, done } = await reader.read();
        if (done) {
          doneReading = true;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.conversation_id && !currentConversationId) {
                setCurrentConversationId(data.conversation_id);
              }
              if (data.content) {
                appendStreamingChunk(data.content);
              }
              if (data.error) {
                appendStreamingChunk(`\n\n**Error:** ${data.error}`);
              }
            } catch (e) {
              // Ignore non-JSON lines
            }
          }
        }
      }
    } catch (err: any) {
      appendStreamingChunk(`\n\n*Connection error: ${err.message}*`);
    } finally {
      setIsStreaming(false);
      clearAttachedFiles();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
      resetStreaming();
    }
  };

  // Russian greeting
  const getGreeting = () => {
    if (user?.name) {
      return `Добрый день, ${user.name}`;
    }
    return 'Добрый день';
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background bg-grid-pattern relative overflow-hidden">
      {/* Background Animated Ambient Aura */}
      <div className="ambient-glow-primary pointer-events-none" />

      {/* Clean Navbar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3.5 border-b border-surface-border bg-surface-dark/75 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-surface border border-surface-border text-zinc-300 hover:text-white md:hidden cursor-pointer"
            title="Меню"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Right Nav Action: Upgrade Plan Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary hover:brightness-110 text-white text-xs font-bold shadow-md shadow-primary/25 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Обновить тариф</span>
            <span className="sm:hidden">Тариф</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 relative z-10 flex flex-col">
        {messages.length === 0 && !streamingMessage ? (
          /* Clean Luxury Welcome Screen */
          <div className="my-auto flex flex-col items-center justify-center text-center py-6 px-4 max-w-3xl mx-auto w-full">
            {/* Header & Subtitle */}
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary-light text-xs font-bold mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>WEN AI Next-Gen Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                {getGreeting()}!
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
                Чем я могу помочь вам сегодня? Выберите готовый сценарий или напишите свой запрос.
              </p>
            </div>

            {/* Interactive Suggestion Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
              {SUGGESTIONS.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleSendMessage(card.prompt)}
                  className="gradient-border-card p-4 rounded-2xl cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center border border-white/[0.08] group-hover:border-primary/40 transition-colors">
                        {card.icon}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 group-hover:text-primary-light transition-colors">
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-primary-light transition-colors flex items-center justify-between">
                      <span>{card.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Render Message List */
          <div className="space-y-4 max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {/* Live Streaming Bubble */}
            {isStreaming && (
              <MessageItem
                message={{
                  role: 'assistant',
                  content: streamingMessage || '...',
                }}
                isStreaming={true}
              />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with High Z-Index so popups are never blocked */}
      <div className="relative z-30 flex-shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
        />
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
};
