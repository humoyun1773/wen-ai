import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  X,
  MoreVertical,
  Image as ImageIcon,
  BookOpen,
  Clock,
  Plug,
  Folder,
  Code2,
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
    setSidebarOpen,
    clearAttachedFiles,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.get('/conversations');
      return res.data;
    },
  });

  // Delete conversation
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

  // Pin/Unpin conversation
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
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSelectChat = (id: string) => {
    setCurrentConversationId(id);
    navigate(`/chat/${id}`);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredConversations.filter((c) => c.is_pinned);
  const recentChats = filteredConversations.filter((c) => !c.is_pinned);

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 h-screen flex flex-col bg-surface-dark border-r border-surface-border flex-shrink-0 transition-transform duration-300 ease-in-out select-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${!isSidebarOpen && 'md:w-[72px]'}`}
      >
        {/* Collapsed view on desktop */}
        {!isSidebarOpen && (
          <div className="hidden md:flex flex-col items-center py-5 px-3 w-full justify-between h-full">
            <div className="flex flex-col items-center gap-3">
              <div
                onClick={() => navigate('/chat')}
                className="w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center font-black text-[11px] text-white shadow-md cursor-pointer hover:border-primary/50 transition-all"
              >
                WEN
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2.5 rounded-xl bg-surface/80 hover:bg-surface-light border border-surface-border text-zinc-400 hover:text-white transition-all"
                title="Развернуть панель"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNewChat}
                className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white shadow-lg shadow-primary/25 transition-all"
                title="Новый чат"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleNavClick('/images')}
                className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-light"
                title="Изображения"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleNavClick('/codex')}
                className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-light"
                title="Wen"
              >
                <Code2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={logout}
                className="p-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {isSidebarOpen && (
          <div className="flex flex-col h-full w-full">
            {/* Brand Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
              <div
                onClick={() => {
                  navigate('/chat');
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className="cursor-pointer py-1"
              >
                <span className="font-black text-lg tracking-wider text-white">
                  WEN AI
                </span>
              </div>

              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-light border border-transparent hover:border-surface-border transition-all"
                title="Свернуть"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Core Feature Navigation Bar (Новый чат, Изображения, Библиотека, Запланированное, Плагины, Проекты, Wen) */}
            <div className="p-3 space-y-1 border-b border-surface-border/60">
              <NavItem
                icon={<Plus className="w-4 h-4 text-primary-light" />}
                label="Новый чат"
                active={location.pathname === '/chat' && !currentConversationId}
                onClick={handleNewChat}
                highlight
              />
              <NavItem
                icon={<ImageIcon className="w-4 h-4 text-accent-rose" />}
                label="Изображения"
                active={location.pathname === '/images'}
                onClick={() => handleNavClick('/images')}
              />
              <NavItem
                icon={<BookOpen className="w-4 h-4 text-accent-cyan" />}
                label="Библиотека"
                active={location.pathname === '/library'}
                onClick={() => handleNavClick('/library')}
              />
              <NavItem
                icon={<Clock className="w-4 h-4 text-accent-emerald" />}
                label="Запланированное"
                active={location.pathname === '/scheduled'}
                onClick={() => handleNavClick('/scheduled')}
              />
              <NavItem
                icon={<Plug className="w-4 h-4 text-primary-light" />}
                label="Плагины"
                active={location.pathname === '/plugins'}
                onClick={() => handleNavClick('/plugins')}
              />
              <NavItem
                icon={<Folder className="w-4 h-4 text-accent-amber" />}
                label="Проекты"
                active={location.pathname === '/projects'}
                onClick={() => handleNavClick('/projects')}
              />
              <NavItem
                icon={<Code2 className="w-4 h-4 text-accent-violet" />}
                label="Wen"
                active={location.pathname === '/codex'}
                onClick={() => handleNavClick('/codex')}
              />
            </div>

            {/* Search Bar */}
            <div className="px-3 pt-2.5 pb-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Поиск чатов..."
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
              {pinnedChats.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-bold text-primary-light uppercase tracking-widest flex items-center gap-1.5">
                    <Pin className="w-3 h-3" />
                    <span>Закрепленные ({pinnedChats.length})</span>
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

              <div className="space-y-1">
                <div className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3 h-3" />
                  <span>История чатов</span>
                </div>
                {isLoading ? (
                  <div className="p-4 text-center text-xs text-zinc-500 animate-pulse">
                    Загрузка...
                  </div>
                ) : recentChats.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500 border border-dashed border-surface-border rounded-2xl">
                    История чатов пуста
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

            {/* User Profile & Popover Menu at the Bottom */}
            <div className="relative p-3 border-t border-surface-border bg-surface/90" ref={profileMenuRef}>
              {isProfileMenuOpen && (
                <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface-dark/95 backdrop-blur-2xl border border-surface-borderLight rounded-3xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-surface-border">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                    <div className="mt-1.5">
                      <span
                        className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                          isAdmin
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-primary/15 text-primary-light border-primary/30'
                        }`}
                      >
                        {isAdmin ? 'АДМИНИСТРАТОР' : 'PREMIUM ПОЛЬЗОВАТЕЛЬ'}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <>
                      <MenuOption
                        icon={<Shield className="w-4 h-4 text-emerald-400" />}
                        label="Панель администратора"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/admin');
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                      />
                      <MenuOption
                        icon={<FileText className="w-4 h-4 text-accent-cyan" />}
                        label="Документы и RAG"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/documents');
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                      />
                      <MenuOption
                        icon={<Terminal className="w-4 h-4 text-accent-rose" />}
                        label="Библиотека промптов"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/prompts');
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                      />
                      <div className="my-1 border-t border-surface-border" />
                    </>
                  )}

                  <MenuOption
                    icon={<Settings className="w-4 h-4 text-zinc-300" />}
                    label="Настройки"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/settings');
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                  />

                  <MenuOption
                    icon={<LogOut className="w-4 h-4 text-red-400" />}
                    label="Выйти из аккаунта"
                    danger
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                  />
                </div>
              )}

              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center justify-between p-2 rounded-2xl bg-surface-dark/60 hover:bg-surface-light border border-surface-border cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-md">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-primary-light transition-colors">
                      {user?.name || 'Пользователь'}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-lg text-zinc-400 group-hover:text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}> = ({ icon, label, active, onClick, highlight }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        active
          ? 'bg-primary/20 text-white border border-primary/40 shadow-sm'
          : highlight
          ? 'text-white hover:bg-surface-light hover:text-white'
          : 'text-zinc-400 hover:bg-surface hover:text-zinc-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const MenuOption: React.FC<{
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}> = ({ icon, label, danger, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-zinc-300 hover:text-white hover:bg-surface-light'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const ChatItem: React.FC<{
  conv: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  title?: string;
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
          title={conv.is_pinned ? 'Открепить' : 'Закрепить'}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-surface-dark"
          title="Удалить"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
