import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/authStore';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { Conversation } from '@/types';
import {
  Plus,
  MessageSquare,
  Search,
  Pin,
  Trash2,
  FileText,
  Terminal,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const {
    currentConversationId,
    setCurrentConversationId,
    isSidebarOpen,
    toggleSidebar,
    clearAttachedFiles,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.get('/conversations');
      return res.data;
    },
  });

  // Delete conversation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/conversations/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (currentConversationId === deletedId) {
        setCurrentConversationId(null);
        navigate('/chat');
      }
    },
  });

  // Pin/Unpin conversation mutation
  const pinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      await apiClient.patch(`/conversations/${id}`, { is_pinned: !isPinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleNewChat = () => {
    setCurrentConversationId(null);
    clearAttachedFiles();
    navigate('/chat');
  };

  const handleSelectChat = (id: string) => {
    setCurrentConversationId(id);
    navigate(`/chat/${id}`);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredConversations.filter((c) => c.is_pinned);
  const recentChats = filteredConversations.filter((c) => !c.is_pinned);

  if (!isSidebarOpen) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-2 w-16 bg-surface-dark border-r border-surface-border justify-between h-screen">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl bg-surface hover:bg-surface-light border border-surface-border text-zinc-300 hover:text-white transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleNewChat}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={logout}
            className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 md:w-80 h-screen flex flex-col bg-surface-dark border-r border-surface-border flex-shrink-0 z-30 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border/60">
        <div
          onClick={() => navigate('/chat')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                WEN AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary-light border border-primary/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Universal Assistant</p>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
          title="Collapse"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Action Button: New Chat */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Chat</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Suhbatlarni izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface/80 border border-surface-border rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 py-2">
        {/* Pinned Section */}
        {pinnedChats.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Pin className="w-3 h-3 text-primary-light" />
              <span>Biriktirilgan</span>
            </div>
            {pinnedChats.map((conv) => (
              <ChatItem
                key={conv.id}
                conv={conv}
                isSelected={currentConversationId === conv.id}
                onSelect={() => handleSelectChat(conv.id)}
                onDelete={() => deleteMutation.mutate(conv.id)}
                onTogglePin={() =>
                  pinMutation.mutate({ id: conv.id, isPinned: conv.is_pinned })
                }
              />
            ))}
          </div>
        )}

        {/* Recent Section */}
        <div className="space-y-1">
          <div className="px-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Yaqindagi Suhbatlar
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              Yuklanmoqda...
            </div>
          ) : recentChats.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              Suhbatlar topilmadi
            </div>
          ) : (
            recentChats.map((conv) => (
              <ChatItem
                key={conv.id}
                conv={conv}
                isSelected={currentConversationId === conv.id}
                onSelect={() => handleSelectChat(conv.id)}
                onDelete={() => deleteMutation.mutate(conv.id)}
                onTogglePin={() =>
                  pinMutation.mutate({ id: conv.id, isPinned: conv.is_pinned })
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 border-t border-surface-border bg-surface-dark space-y-1">
        <NavLink
          icon={<FileText className="w-4 h-4" />}
          label="Document AI (RAG)"
          active={location.pathname === '/documents'}
          onClick={() => navigate('/documents')}
        />
        <NavLink
          icon={<Terminal className="w-4 h-4" />}
          label="Prompt Kutubxonasi"
          active={location.pathname === '/prompts'}
          onClick={() => navigate('/prompts')}
        />
        {user?.role === 'admin' && (
          <NavLink
            icon={<Shield className="w-4 h-4 text-emerald-400" />}
            label="Admin Boshqaruvi"
            active={location.pathname === '/admin'}
            onClick={() => navigate('/admin')}
          />
        )}
        <NavLink
          icon={<Settings className="w-4 h-4" />}
          label="Sozlamalar"
          active={location.pathname === '/settings'}
          onClick={() => navigate('/settings')}
        />
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-surface-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-100 truncate">
              {user?.name || 'Foydalanuvchi'}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Tizimdan chiqish"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

const ChatItem: React.FC<{
  conv: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}> = ({ conv, isSelected, onSelect, onDelete, onTogglePin }) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-surface-light text-white font-medium shadow-sm border border-surface-border'
          : 'text-zinc-300 hover:bg-surface-light/50 hover:text-zinc-100'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-primary-light flex-shrink-0" />
        <span className="text-xs truncate">{conv.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded hover:bg-surface ${
            conv.is_pinned ? 'text-primary-light' : 'text-zinc-400 hover:text-white'
          }`}
          title={conv.is_pinned ? 'Unpin' : 'Pin'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-surface"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
        active
          ? 'bg-primary/15 text-primary-light border border-primary/30'
          : 'text-zinc-400 hover:bg-surface-light hover:text-zinc-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
