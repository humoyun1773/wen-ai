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
} from 'lucide-react';

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
            className="px-4 py-2 rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary hover:brightness-110 text-white text-xs font-bold shadow-md shadow-primary/25 transition-all active:scale-95 cursor-pointer"
          >
            <span className="hidden sm:inline">Обновить тариф</span>
            <span className="sm:hidden">Тариф</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 relative z-10 flex flex-col">
        {messages.length === 0 && !streamingMessage ? (
          /* Clean Minimalist Welcome Screen */
          <div className="my-auto flex flex-col items-center justify-center text-center py-8 px-4 max-w-xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              {getGreeting()}!
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed">
              Чем я могу помочь вам сегодня?
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
