import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/authStore';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { Message } from '@/types';
import { MessageItem } from '@/widgets/MessageItem';
import { ChatInput } from '@/widgets/ChatInput';
import { UpgradePlanModal } from '@/widgets/UpgradePlanModal';
import { LanguageSelector, SUPPORTED_LANGUAGES } from '@/widgets/LanguageSelector';
import {
  Bot,
  Sparkles,
  Menu,
} from 'lucide-react';

export const ChatArea: React.FC = () => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  // Default language is English ('en')
  const [currentLang, setCurrentLang] = useState<string>(() => {
    return localStorage.getItem('wen_ai_lang') || 'en';
  });

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

  const handleSelectLanguage = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem('wen_ai_lang', code);
  };

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

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    SUPPORTED_LANGUAGES[0];

  // Dynamic localized personalized greeting
  const getGreeting = () => {
    const base = currentLangObj.greeting;
    if (user?.name) {
      return `${base}, ${user.name}`;
    }
    return base;
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background bg-grid-pattern relative overflow-hidden">
      {/* Clean Header Bar (Without model dropdown and AI online badge) */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3.5 border-b border-surface-border bg-surface-dark/75 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-surface border border-surface-border text-zinc-300 hover:text-white md:hidden"
            title="Menyu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 hidden sm:inline">
            WEN AI
          </span>
        </div>

        {/* Right Nav Actions: Language Switcher (20 Languages) & Upgrade Plan */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 20-Language Selector Dropdown (Default English) */}
          <LanguageSelector
            currentLang={currentLang}
            onSelectLang={handleSelectLanguage}
          />

          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary hover:brightness-110 text-white text-xs font-bold shadow-md shadow-primary/25 transition-all active:scale-95 group"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Upgrade Plan</span>
            <span className="sm:hidden">Upgrade</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 relative z-10 flex flex-col">
        {messages.length === 0 && !streamingMessage ? (
          /* Clean Multilingual Welcome Screen */
          <div className="my-auto flex flex-col items-center justify-center text-center py-8 px-4 max-w-xl mx-auto">
            {/* Logo Orb */}
            <div className="relative mb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-primary via-primary-light to-secondary flex items-center justify-center shadow-2xl shadow-primary/40 animate-float">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent-rose rounded-3xl blur-xl opacity-30 -z-10 animate-pulse-subtle" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Artificial Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2.5">
              {getGreeting()}!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
              {currentLangObj.subtitle}
            </p>
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
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isStreaming}
      />

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
};
