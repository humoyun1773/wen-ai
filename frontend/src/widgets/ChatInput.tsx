import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/app/store/chatStore';
import { ModelSelector } from '@/widgets/ModelSelector';
import { AttachmentToolsMenu } from '@/widgets/AttachmentToolsMenu';
import { apiClient } from '@/shared/api';
import {
  Send,
  Plus,
  X,
  FileText,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Image as ImageIcon,
  Music,
  Layout,
  Atom,
  BookOpen,
  User,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [activeTool, setActiveTool] = useState<{ id: string; label: string; icon: React.ReactNode } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const notebookInputRef = useRef<HTMLInputElement>(null);

  const {
    attachedFiles,
    attachFile,
    removeAttachedFile,
    isStreaming,
  } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || disabled || isStreaming) return;
    let fullMessage = text.trim();
    if (activeTool) {
      fullMessage = `[${activeTool.label}]: ${fullMessage}`;
    }
    onSendMessage(fullMessage);
    setText('');
    setActiveTool(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      attachFile(res.data);
    } catch {
      alert("Ошибка при загрузке файла. Размер файла не должен превышать 25 МБ.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (notebookInputRef.current) notebookInputRef.current.value = '';
    }
  };

  const handleActionSelect = (action: string) => {
    switch (action) {
      case 'upload_files':
        fileInputRef.current?.click();
        break;
      case 'drive':
        navigate('/documents');
        break;
      case 'photos':
        imageInputRef.current?.click();
        break;
      case 'avatar':
        navigate('/settings');
        break;
      case 'notebooks':
        notebookInputRef.current?.click();
        break;
      case 'create_image':
        setActiveTool({
          id: 'create_image',
          label: 'Создание изображений',
          icon: <ImageIcon className="w-3.5 h-3.5 text-accent-rose" />,
        });
        textareaRef.current?.focus();
        break;
      case 'create_music':
        setActiveTool({
          id: 'create_music',
          label: 'Создание музыки',
          icon: <Music className="w-3.5 h-3.5 text-accent-cyan" />,
        });
        textareaRef.current?.focus();
        break;
      case 'canvas':
        setActiveTool({
          id: 'canvas',
          label: 'Режим Canvas',
          icon: <Layout className="w-3.5 h-3.5 text-accent-violet" />,
        });
        textareaRef.current?.focus();
        break;
      case 'deep_research':
        setActiveTool({
          id: 'deep_research',
          label: 'Глубокое исследование',
          icon: <Atom className="w-3.5 h-3.5 text-accent-cyan" />,
        });
        textareaRef.current?.focus();
        break;
      case 'guided_learning':
        setActiveTool({
          id: 'guided_learning',
          label: 'Обучение с ИИ',
          icon: <BookOpen className="w-3.5 h-3.5 text-accent-emerald" />,
        });
        textareaRef.current?.focus();
        break;
      case 'personal_ai':
        setActiveTool({
          id: 'personal_ai',
          label: 'Персональный ИИ (Labs)',
          icon: <User className="w-3.5 h-3.5 text-primary-light" />,
        });
        textareaRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Ваш браузер не поддерживает голосовой ввод.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2 relative z-30">
      {/* Active Tool Badge and Attached Files Bar */}
      {(activeTool || attachedFiles.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-2 px-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Active Tool Badge */}
          {activeTool && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-primary/20 border border-primary/50 text-xs text-white shadow-lg backdrop-blur-md">
              {activeTool.icon}
              <span className="font-semibold">{activeTool.label}</span>
              <button
                type="button"
                onClick={() => setActiveTool(null)}
                className="text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-white/[0.1] transition-all cursor-pointer"
                title="Отменить режим"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Attached Files */}
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-surface/90 border border-surface-borderLight text-xs text-zinc-100 shadow-md backdrop-blur-md"
            >
              <FileText className="w-3.5 h-3.5 text-primary-light flex-shrink-0" />
              <span className="max-w-[160px] truncate font-medium">{file.file_name}</span>
              <button
                type="button"
                onClick={() => removeAttachedFile(file.id)}
                className="text-zinc-400 hover:text-red-400 transition-colors p-0.5 rounded-full hover:bg-surface-light cursor-pointer"
                title="Удалить"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Glassmorphism Container */}
      <div className="relative z-30 flex flex-col bg-surface/80 backdrop-blur-2xl border border-surface-borderLight rounded-3xl shadow-2xl focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 transition-all p-3.5">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            activeTool
              ? `Введите запрос для [${activeTool.label}]...`
              : "Спросите WEN AI о чем угодно... (Shift+Enter для новой строки)"
          }
          disabled={disabled || isStreaming}
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none min-h-[46px] max-h-[220px] leading-6 px-2.5 pt-1.5 font-sans"
        />

        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] mt-2 relative">
          {/* Left Tools */}
          <div className="flex items-center gap-2 relative">
            {/* Attachment & Tools Button (+) with Full Flyout Submenus */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                disabled={isUploading || isStreaming}
                className="flex items-center justify-center w-9 h-9 rounded-2xl bg-surface hover:bg-surface-light border border-surface-border text-zinc-300 hover:text-white transition-all hover:border-primary/40 active:scale-95 cursor-pointer"
                title="Прикрепить файлы и инструменты"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-light" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>

              {/* Flyout Menu */}
              <AttachmentToolsMenu
                isOpen={isAttachmentMenuOpen}
                onClose={() => setIsAttachmentMenuOpen(false)}
                onUploadClick={() => fileInputRef.current?.click()}
                onActionSelect={handleActionSelect}
              />
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.csv,.json,.png,.jpg,.jpeg,.zip"
            />
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
            <input
              type="file"
              ref={notebookInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".ipynb,.py,.json,.txt"
            />

            <ModelSelector />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  : 'bg-surface/70 hover:bg-surface-light border-surface-border text-zinc-400 hover:text-zinc-200'
              }`}
              title="Голосовой ввод"
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Right Tool: Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || disabled || isStreaming}
            className="flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-tr from-primary via-primary-light to-secondary hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 text-white shadow-lg shadow-primary/30 transition-all duration-200 active:scale-95 group cursor-pointer"
            title="Отправить сообщение"
          >
            <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500 text-center mt-2.5 font-medium">
        <span>⚡ Real-time SSE Streaming</span>
        <span>•</span>
        <span>🔒 Защищенное соединение</span>
        <span>•</span>
        <span>📄 База знаний RAG</span>
      </div>
    </div>
  );
};
