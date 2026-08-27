import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/app/store/chatStore';
import { ModelSelector } from '@/widgets/ModelSelector';
import { apiClient } from '@/shared/api';
import { Send, Paperclip, X, FileText, Sparkles, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        200
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
    onSendMessage(text.trim());
    setText('');
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
    } catch (err) {
      alert("Fayl yuklashda xatolik yuz berdi. Hajmi 25MB dan oshmasligi kerak.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6">
      {/* Attached Files Preview Bar */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-2">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-zinc-200"
            >
              <FileText className="w-3.5 h-3.5 text-primary-light" />
              <span className="max-w-[150px] truncate">{file.file_name}</span>
              <button
                type="button"
                onClick={() => removeAttachedFile(file.id)}
                className="text-zinc-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative flex flex-col bg-surface border border-surface-border rounded-2xl shadow-xl focus-within:border-primary/60 transition-all p-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="WEN AI dan istalgan narsani so'rang... (Shift+Enter yangi qator)"
          disabled={disabled || isStreaming}
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none min-h-[44px] max-h-[200px] leading-6 px-2 pt-1"
        />

        <div className="flex items-center justify-between pt-2 border-t border-surface-border/40 mt-2">
          {/* Left tools: Model Selector + File Upload */}
          <div className="flex items-center gap-2">
            <ModelSelector />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.csv,.json,.png,.jpg,.jpeg"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isStreaming}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-light/60 hover:bg-surface-light border border-surface-border text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              title="Fayl yoki Hujjat yuklash (PDF, DOCX, TXT, CSV)"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-light" />
              ) : (
                <Paperclip className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Hujjat</span>
            </button>
          </div>

          {/* Right tool: Send button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || disabled || isStreaming}
            className="flex items-center justify-center p-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:hover:bg-primary text-white shadow-lg shadow-primary/25 transition-all duration-200 active:scale-95"
            title="Yuborish"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-[11px] text-zinc-500 text-center mt-2">
        WEN AI muhim faktlarni xato qilishi mumkin. Hujjat va ma'lumotlarni tekshirib ko'ring.
      </p>
    </div>
  );
};
