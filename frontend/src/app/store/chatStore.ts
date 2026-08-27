import { create } from 'zustand';
import { Conversation, Message, ModelInfo, FileAttachment } from '@/types';

interface ChatState {
  currentConversationId: string | null;
  selectedModel: string;
  selectedPromptId: string | null;
  attachedFiles: FileAttachment[];
  isSidebarOpen: boolean;
  isStreaming: boolean;
  streamingMessage: string;

  setCurrentConversationId: (id: string | null) => void;
  setSelectedModel: (model: string) => void;
  setSelectedPromptId: (id: string | null) => void;
  attachFile: (file: FileAttachment) => void;
  removeAttachedFile: (fileId: string) => void;
  clearAttachedFiles: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setStreamingMessage: (msg: string | ((prev: string) => string)) => void;
  appendStreamingChunk: (chunk: string) => void;
  resetStreaming: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentConversationId: null,
  selectedModel: 'wen-3.6-flash',
  selectedPromptId: null,
  attachedFiles: [],
  isSidebarOpen: true,
  isStreaming: false,
  streamingMessage: '',

  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setSelectedPromptId: (id) => set({ selectedPromptId: id }),
  attachFile: (file) =>
    set((state) => ({
      attachedFiles: state.attachedFiles.some((f) => f.id === file.id)
        ? state.attachedFiles
        : [...state.attachedFiles, file],
    })),
  removeAttachedFile: (fileId) =>
    set((state) => ({
      attachedFiles: state.attachedFiles.filter((f) => f.id !== fileId),
    })),
  clearAttachedFiles: () => set({ attachedFiles: [] }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingMessage: (msg) =>
    set((state) => ({
      streamingMessage: typeof msg === 'function' ? msg(state.streamingMessage) : msg,
    })),
  appendStreamingChunk: (chunk) =>
    set((state) => ({
      streamingMessage: state.streamingMessage + chunk,
    })),
  resetStreaming: () => set({ isStreaming: false, streamingMessage: '' }),
}));
