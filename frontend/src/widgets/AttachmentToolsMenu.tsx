import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip,
  HardDrive,
  MoreHorizontal,
  ChevronRight,
  Image as ImageIcon,
  Music,
  Layout,
  Atom,
  BookOpen,
  User,
  BookMarked,
} from 'lucide-react';

interface AttachmentToolsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadClick: () => void;
  onActionSelect: (action: string) => void;
}

export const AttachmentToolsMenu: React.FC<AttachmentToolsMenuProps> = ({
  isOpen,
  onClose,
  onUploadClick,
  onActionSelect,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<'none' | 'uploads' | 'tools'>('none');
  const [isPersonalIntelligenceActive, setIsPersonalIntelligenceActive] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
        setActiveSubmenu('none');
      }
    };
    if (isOpen) {
      // Use setTimeout so the opening click doesn't immediately close it
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 50);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (action: string) => {
    onActionSelect(action);
    onClose();
    setActiveSubmenu('none');
  };

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 mb-3 z-50 flex items-end gap-1.5 animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Main Menu Panel */}
      <div className="w-56 bg-[#18181b] border border-white/[0.15] rounded-2xl shadow-2xl p-1.5 space-y-0.5 text-xs text-zinc-200">
        {/* Upload files */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAction('upload_files')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
        >
          <Paperclip className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Загрузить файлы</span>
        </button>

        {/* Add from Drive */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAction('drive')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
        >
          <HardDrive className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Добавить из Drive</span>
        </button>

        {/* More uploads > */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('uploads')}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              setActiveSubmenu(activeSubmenu === 'uploads' ? 'none' : 'uploads')
            }
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
              activeSubmenu === 'uploads'
                ? 'bg-white/[0.15] text-white'
                : 'hover:bg-white/[0.1] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MoreHorizontal className="w-4 h-4 text-zinc-400" />
              <span className="font-medium">Другие загрузки</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        <div className="my-1 border-t border-white/[0.1]" />

        {/* Create image */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAction('create_image')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
        >
          <ImageIcon className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Создать изображение</span>
        </button>

        {/* Create music */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAction('create_music')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
        >
          <Music className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Создать музыку</span>
        </button>

        {/* Canvas */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAction('canvas')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
        >
          <Layout className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Режим Canvas</span>
        </button>

        {/* More tools > */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('tools')}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              setActiveSubmenu(activeSubmenu === 'tools' ? 'none' : 'tools')
            }
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
              activeSubmenu === 'tools'
                ? 'bg-white/[0.15] text-white'
                : 'hover:bg-white/[0.1] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MoreHorizontal className="w-4 h-4 text-zinc-400" />
              <span className="font-medium">Другие инструменты</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Submenu 1: More Uploads (Photos, Avatar, Notebooks) */}
      {activeSubmenu === 'uploads' && (
        <div className="w-52 bg-[#18181b] border border-white/[0.15] rounded-2xl shadow-2xl p-1.5 space-y-0.5 text-xs text-zinc-200 animate-in fade-in slide-in-from-left-2 duration-100">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAction('photos')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
          >
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Фотографии</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAction('avatar')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
          >
            <User className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Аватар</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAction('notebooks')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
          >
            <BookMarked className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Блокноты</span>
          </button>
        </div>
      )}

      {/* Submenu 2: More Tools (Deep research, Guided learning, Personal Intelligence) */}
      {activeSubmenu === 'tools' && (
        <div className="w-60 bg-[#18181b] border border-white/[0.15] rounded-2xl shadow-2xl p-1.5 space-y-0.5 text-xs text-zinc-200 animate-in fade-in slide-in-from-left-2 duration-100">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAction('deep_research')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
          >
            <Atom className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Глубокое исследование</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAction('guided_learning')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all text-left cursor-pointer active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Обучение с ИИ</span>
          </button>

          {/* Personal Intelligence */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAction('personal_ai')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.1] cursor-pointer transition-all text-left select-none"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="font-medium">Персональный ИИ</p>
                <p className="text-[10px] text-zinc-500 font-mono">Labs</p>
              </div>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      )}
    </div>
  );
};
