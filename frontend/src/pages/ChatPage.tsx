import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/widgets/Sidebar';
import { ChatArea } from '@/widgets/ChatArea';
import { useChatStore } from '@/app/store/chatStore';

export const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId);

  useEffect(() => {
    if (id) {
      setCurrentConversationId(id);
    } else {
      setCurrentConversationId(null);
    }
  }, [id, setCurrentConversationId]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-zinc-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <ChatArea />
      </main>
    </div>
  );
};
