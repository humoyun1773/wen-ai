import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { Message } from '@/types';
import { MessageItem } from '@/widgets/MessageItem';
import { ChatInput } from '@/widgets/ChatInput';
import { Bot, Code2, FileSearch, Sparkles, Languages } from 'lucide-react';

export const ChatArea: React.FC = () => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    currentConversationId,
    setCurrentConversationId,
    selectedModel,
    selectedPromptId,
    attachedFiles,
    clearAttachedFiles,
    isStreaming,
    setIsStreaming,
    streamingMessage,
    setStreamingMessage,
    appendStreamingChunk,
    resetStreaming,
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

    // Optimistically create UI state
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
            } catch (e) {
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
      // Invalidate queries to refresh history
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
      resetStreaming();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-surface-border/60 bg-surface/30 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-300">
            WEN AI Universal Engine
          </span>
        </div>
        <div className="text-xs text-zinc-400">
          Model: <span className="font-mono text-primary-light font-medium">{selectedModel}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !streamingMessage ? (
          /* Empty / Welcome State */
          <div className="max-w-3xl mx-auto my-auto flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 animate-pulse-subtle">
              <Bot className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
              Bugun sizga qanday yordam bera olaman?
            </h1>
            <p className="text-sm text-zinc-400 max-w-lg mb-8">
              WEN AI orqali kod yozishingiz, PDF va hujjatlarni tahlil qilishingiz, matnlarni tarjima qilishingiz va murakkab masalalarni hal qilishingiz mumkin.
            </p>

            {/* Quick Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
              <SuggestionCard
                icon={<Code2 className="w-4 h-4 text-primary-light" />}
                title="FastAPI va React arxitekturasi"
                subtitle="Clean architecture asosida backend yaratish"
                onClick={() =>
                  handleSendMessage(
                    "FastAPI va React uchun Clean Architecture qoidalariga asoslangan to'liq loyiha strukturasini yozib ber."
                  )
                }
              />
              <SuggestionCard
                icon={<FileSearch className="w-4 h-4 text-accent-cyan" />}
                title="Hujjatlarni tahlil qilish (RAG)"
                subtitle="PDF, DOCX yoki CSV faylni o'qitish"
                onClick={() =>
                  handleSendMessage(
                    "PDF yoki matnli hujjatlardan ma'lumot qidirish va tahlil qilish uchun RAG tizimi qanday ishlaydi?"
                  )
                }
              />
              <SuggestionCard
                icon={<Languages className="w-4 h-4 text-accent-pink" />}
                title="Matn va Til Tarjimasi"
                subtitle="Professional darajada tahrir va tarjima"
                onClick={() =>
                  handleSendMessage(
                    "O'zbek tilidagi rasmiy xat yoki shartnoma uchun kirish qismini professional tarzda tuzib ber."
                  )
                }
              />
              <SuggestionCard
                icon={<Sparkles className="w-4 h-4 text-accent-emerald" />}
                title="Kod xatolarini tekshirish"
                subtitle="Algoritmlar va optimallashtirish"
                onClick={() =>
                  handleSendMessage(
                    "Python va TypeScript da async/await xatolarini topish va unumdorlikni oshirish usullari."
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
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ icon, title, subtitle, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-2xl bg-surface border border-surface-border hover:border-primary/50 hover:bg-surface-light/60 transition-all duration-200 group text-left"
    >
      <div className="p-2 rounded-xl bg-surface-dark border border-surface-border group-hover:border-primary/40 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-primary-light transition-colors">
          {title}
        </h4>
        <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
};
