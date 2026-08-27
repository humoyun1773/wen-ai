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
  Layers,
  Flame,
  X,
  Compass,
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
      <div className="hidden md:flex flex-col items-center py-5 px-3 w-[72px] bg-surface-dark border-r border-surface-border justify-between h-screen z-30 select-none">
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => navigate('/chat')}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-primary-light to-secondary flex items-center justify-center shadow-lg shadow-primary/30 cursor-pointer hover:scale-105 transition-transform"
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl bg-surface/80 hover:bg-surface-light border border-surface-border text-zinc-400 hover:text-white transition-all"
            title="Sidebar-ni kengaytirish"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewChat}
            className="p-3 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white shadow-lg shadow-primary/25 transition-all active:scale-95"
            title="Yangi Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/documents')}
            className={`p-2.5 rounded-xl transition-all ${
              location.pathname === '/documents'
                ? 'bg-primary/20 text-primary-light border border-primary/30'
                : 'text-zinc-400 hover:text-white hover:bg-surface-light'
            }`}
            title="Document AI"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`p-2.5 rounded-xl transition-all ${
              location.pathname === '/settings'
                ? 'bg-primary/20 text-primary-light border border-primary/30'
                : 'text-zinc-400 hover:text-white hover:bg-surface-light'
            }`}
            title="Sozlamalar"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 md:w-80 h-screen flex flex-col bg-surface-dark border-r border-surface-border flex-shrink-0 z-30 transition-all duration-300 relative select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <div
          onClick={() => navigate('/chat')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-primary-light to-secondary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface-dark" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                WEN AI
              </span>
              <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-md bg-gradient-to-r from-primary/30 to-secondary/30 text-primary-light border border-primary/30 shadow-sm">
                NEXUS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Universal AI Platform</p>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-light border border-transparent hover:border-surface-border transition-all"
          title="Yopish"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Action Button: New Chat */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary via-primary-hover to-secondary hover:opacity-95 text-white text-xs font-bold tracking-wide shadow-lg shadow-primary/25 transition-all duration-200 active:scale-[0.98] group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>YANGI SUHBAT OCHISH</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Suhbatlarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-surface/60 border border-surface-border rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:bg-surface transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 py-2">
        {/* Pinned Section */}
        {pinnedChats.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold text-primary-light uppercase tracking-widest flex items-center gap-1.5">
              <Pin className="w-3 h-3" />
              <span>Biriktirilgan ({pinnedChats.length})</span>
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
          <div className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            <span>Tarix</span>
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-xs text-zinc-500 animate-pulse">
              Yuklanmoqda...
            </div>
          ) : recentChats.length === 0 ? (
            <div className="p-5 text-center text-xs text-zinc-500 border border-dashed border-surface-border rounded-2xl">
              Hozircha suhbatlar yo'q
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

      {/* Navigation Tools */}
      <div className="p-3 border-t border-surface-border bg-surface-dark/95 space-y-1">
        <NavLink
          icon={<FileText className="w-4 h-4 text-accent-cyan" />}
          label="Document AI & RAG"
          active={location.pathname === '/documents'}
          onClick={() => navigate('/documents')}
        />
        <NavLink
          icon={<Terminal className="w-4 h-4 text-accent-rose" />}
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
          icon={<Settings className="w-4 h-4 text-zinc-300" />}
          label="Sozlamalar"
          active={location.pathname === '/settings'}
          onClick={() => navigate('/settings')}
        />
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-surface-border bg-surface/90 flex items-center justify-between">
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-primary-light transition-colors">
              {user?.name || 'Foydalanuvchi'}
            </p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
          ? 'bg-surface-light border border-primary/40 text-white font-medium shadow-md'
          : 'text-zinc-400 hover:bg-surface hover:text-zinc-200 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            isSelected ? 'text-primary-light' : 'text-zinc-500 group-hover:text-zinc-300'
          }`}
        />
        <span className="text-xs truncate">{conv.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded-lg hover:bg-surface-dark ${
            conv.is_pinned ? 'text-primary-light' : 'text-zinc-500 hover:text-white'
          }`}
          title={conv.is_pinned ? 'Unpin' : 'Pin'}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-surface-dark"
          title="O'chirish"
        >
          <Trash2 className="w-3 h-3" />
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
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        active
          ? 'bg-primary/20 text-white border border-primary/40 shadow-sm'
          : 'text-zinc-400 hover:bg-surface hover:text-zinc-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
