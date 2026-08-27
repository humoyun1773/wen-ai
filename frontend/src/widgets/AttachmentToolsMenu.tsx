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
  ToggleLeft,
  ToggleRight,
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
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 mb-3 z-50 flex items-end gap-1.5 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Main Menu Panel */}
      <div className="w-56 bg-[#18181b]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl p-1.5 space-y-0.5 text-xs text-zinc-200">
        {/* Upload files */}
        <button
          type="button"
          onClick={() => {
            onUploadClick();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
        >
          <Paperclip className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Upload files</span>
        </button>

        {/* Add from Drive */}
        <button
          type="button"
          onClick={() => {
            onActionSelect('drive');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
        >
          <HardDrive className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Add from Drive</span>
        </button>

        {/* More uploads > */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('uploads')}
        >
          <button
            type="button"
            onClick={() =>
              setActiveSubmenu(activeSubmenu === 'uploads' ? 'none' : 'uploads')
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
              activeSubmenu === 'uploads'
                ? 'bg-white/[0.12] text-white'
                : 'hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MoreHorizontal className="w-4 h-4 text-zinc-400" />
              <span className="font-medium">More uploads</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>

        <div className="my-1 border-t border-white/[0.08]" />

        {/* Create image */}
        <button
          type="button"
          onClick={() => {
            onActionSelect('create_image');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
        >
          <ImageIcon className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Create image</span>
        </button>

        {/* Create music */}
        <button
          type="button"
          onClick={() => {
            onActionSelect('create_music');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
        >
          <Music className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Create music</span>
        </button>

        {/* Canvas */}
        <button
          type="button"
          onClick={() => {
            onActionSelect('canvas');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
        >
          <Layout className="w-4 h-4 text-zinc-400" />
          <span className="font-medium">Canvas</span>
        </button>

        {/* More tools > */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('tools')}
        >
          <button
            type="button"
            onClick={() =>
              setActiveSubmenu(activeSubmenu === 'tools' ? 'none' : 'tools')
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
              activeSubmenu === 'tools'
                ? 'bg-white/[0.12] text-white'
                : 'hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MoreHorizontal className="w-4 h-4 text-zinc-400" />
              <span className="font-medium">More tools</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Submenu 1: More Uploads (Photos, Avatar, Notebooks) */}
      {activeSubmenu === 'uploads' && (
        <div className="w-52 bg-[#18181b]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl p-1.5 space-y-0.5 text-xs text-zinc-200 animate-in fade-in slide-in-from-left-2 duration-100">
          <button
            type="button"
            onClick={() => {
              onActionSelect('photos');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
          >
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Photos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onActionSelect('avatar');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
          >
            <User className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Avatar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onActionSelect('notebooks');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
          >
            <BookMarked className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Notebooks</span>
          </button>
        </div>
      )}

      {/* Submenu 2: More Tools (Deep research, Guided learning, Personal Intelligence) */}
      {activeSubmenu === 'tools' && (
        <div className="w-60 bg-[#18181b]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl p-1.5 space-y-0.5 text-xs text-zinc-200 animate-in fade-in slide-in-from-left-2 duration-100">
          <button
            type="button"
            onClick={() => {
              onActionSelect('deep_research');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
          >
            <Atom className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Deep research</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onActionSelect('guided_learning');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors text-left"
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Guided learning</span>
          </button>

          {/* Personal Intelligence toggle switch */}
          <div
            onClick={() =>
              setIsPersonalIntelligenceActive(!isPersonalIntelligenceActive)
            }
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.08] cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="font-medium">Personal Intelligence</p>
                <p className="text-[10px] text-zinc-500 font-mono">Labs</p>
              </div>
            </div>

            <div
              className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors ${
                isPersonalIntelligenceActive ? 'bg-primary' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  isPersonalIntelligenceActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
