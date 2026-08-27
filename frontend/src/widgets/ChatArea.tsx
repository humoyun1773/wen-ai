import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/authStore';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { Message } from '@/types';
import { MessageItem } from '@/widgets/MessageItem';
import { ChatInput } from '@/widgets/ChatInput';
import {
  Bot,
  Code2,
  FileSearch,
  Sparkles,
  Languages,
  Zap,
  Cpu,
  ArrowUpRight,
  Menu,
} from 'lucide-react';

export const ChatArea: React.FC = () => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

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
                appendStreamingChunk(`\n\n**Xatolik:** ${data.error}`);
              }
            } catch {
              // Ignore non-JSON lines
            }
          }
        }
      }
    } catch (err: any) {
      appendStreamingChunk(`\n\n*Server bilan bog'lanishda xatolik yuz berdi: ${err.message}*`);
    } finally {
      setIsStreaming(false);
      clearAttachedFiles();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
      resetStreaming();
    }
  };

  // Dynamic personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Xayrli kun';
    if (hour < 12) timeGreeting = 'Xayrli tong';
    else if (hour >= 18) timeGreeting = 'Xayrli kech';

    if (user?.name) {
      return `${timeGreeting}, ${user.name}`;
    }
    return `${timeGreeting}`;
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background bg-grid-pattern relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-surface-border bg-surface-dark/75 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-surface border border-surface-border text-zinc-300 hover:text-white md:hidden"
            title="Menyu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Online</span>
          </div>
          <span className="text-xs font-medium text-zinc-400 hidden lg:inline">
            WEN Universal Intelligence
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-surface-border text-xs text-zinc-300 font-mono">
            <Cpu className="w-3.5 h-3.5 text-primary-light" />
            <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-none">
              {selectedModel}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 relative z-10">
        {messages.length === 0 && !streamingMessage ? (
          /* Personalized Welcome State */
          <div className="max-w-2xl mx-auto my-auto flex flex-col items-center justify-center text-center py-6 sm:py-8 px-2">
            {/* Logo Orb */}
            <div className="relative mb-4 sm:mb-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-tr from-primary via-primary-light to-secondary flex items-center justify-center shadow-2xl shadow-primary/40 animate-float">
                <Bot className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent-rose rounded-3xl blur-xl opacity-30 -z-10 animate-pulse-subtle" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold mb-2.5">
              <Sparkles className="w-3 h-3" />
              <span>Universal Sun'iy Intellekt</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              {getGreeting()}!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
              Sizga bugun qanday vazifada yordam beray? Istalgan savolingizni bering yoki pastdagi namunalardan tanlang.
            </p>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full text-left">
              <SuggestionCard
                icon={<Code2 className="w-4 h-4 text-primary-light" />}
                category="DASTURLASH"
                title="FastAPI & React Clean Architecture"
                subtitle="Toza arxitektura va andozalar"
                onClick={() =>
                  handleSendMessage(
                    "FastAPI va React TypeScript loyihasi uchun Clean Architecture (Repository, Service, Controller) strukturasini to'liq tushuntirib ber."
                  )
                }
              />
              <SuggestionCard
                icon={<FileSearch className="w-4 h-4 text-accent-cyan" />}
                category="RAG HUJJATLAR"
                title="PDF va Hujjatlarni Tahlil Qilish"
                subtitle="Semantik qidiruv va kontekst"
                onClick={() =>
                  handleSendMessage(
                    "PDF, Word yoki CSV fayllarni RAG tizimiga yuklab, ulardan qanday qilib aniq faktlar bo'yicha savol-javob qilish mumkin?"
                  )
                }
              />
              <SuggestionCard
                icon={<Languages className="w-4 h-4 text-accent-rose" />}
                category="TARJIMA & TAHRIR"
                title="Professional O'zbek Tili Tahriri"
                subtitle="Rasmiy shartnoma va matnlar"
                onClick={() =>
                  handleSendMessage(
                    "Rasmiy xizmat xati yoki shartnomaning kirish qismini o'zbek tilida professional va yuridik jihatdan to'g'ri tuzib ber."
                  )
                }
              />
              <SuggestionCard
                icon={<Zap className="w-4 h-4 text-accent-emerald" />}
                category="OPTIMIZATSIYA"
                title="Algoritm va Xatolarni Tuzatish"
                subtitle="Unumdorlik va xavfsizlik"
                onClick={() =>
                  handleSendMessage(
                    "Python va TypeScript da async/await xatolarini topish va performance optimizatsiya qilish bo'yicha eng yaxshi amaliyotlar qaysilar?"
                  )
                }
              />
            </div>
          </div>
        ) : (
          /* Render Message List */
          <div className="space-y-4">
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

      {/* Input Box */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isStreaming} />
    </div>
  );
};

const SuggestionCard: React.FC<{
  icon: React.ReactNode;
  category: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ icon, category, title, subtitle, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-start gap-3 p-3.5 rounded-2xl bg-surface/75 border border-surface-border hover:border-primary/50 hover:bg-surface-light/90 transition-all duration-200 text-left shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
    >
      <div className="p-2 rounded-xl bg-surface-dark border border-surface-border group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-500 group-hover:text-primary-light transition-colors">
          {category}
        </span>
        <h4 className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors truncate mt-0.5">
          {title}
        </h4>
        <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight line-clamp-1">{subtitle}</p>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-primary-light transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
    </button>
  );
};
