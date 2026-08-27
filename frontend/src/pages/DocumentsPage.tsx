import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useChatStore } from '@/app/store/chatStore';
import { apiClient } from '@/shared/api';
import { FileAttachment } from '@/types';
import {
  FileText,
  UploadCloud,
  Trash2,
  Sparkles,
  MessageSquare,
  FileCheck,
  Search,
  BookOpen,
  Languages,
  CheckCircle2,
  FileCode,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { attachFile } = useChatStore();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<string>('summary');
  const [customQuestion, setCustomQuestion] = useState('');

  // Fetch uploaded files
  const { data: files = [], isLoading } = useQuery<FileAttachment[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await apiClient.get('/files');
      return res.data;
    },
  });

  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      if (selectedFile) setSelectedFile(null);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (err: any) {
      alert("Hujjat yuklashda xatolik yuz berdi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunAnalysis = async (mode: string) => {
    if (!selectedFile) return;
    try {
      setIsAnalyzing(true);
      setAnalysisMode(mode);
      const res = await apiClient.post('/files/analyze', {
        file_id: selectedFile.id,
        mode: mode,
        question: customQuestion,
      });
      setAnalysisResult(res.data.result);
    } catch (err: any) {
      setAnalysisResult("Tahlil qilishda xatolik yuz berdi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatWithFile = (file: FileAttachment) => {
    attachFile(file);
    navigate('/chat');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-light" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Document AI & RAG Engine
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                PDF, Word (DOCX), CSV, TXT va Rasmlarni o'qiting va ulardan aniq faktlar bo'yicha javob oling.
              </p>
            </div>

            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/25 cursor-pointer transition-all active:scale-95">
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Yuklanmoqda...' : 'Hujjat Yuklash'}</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.doc,.txt,.csv,.json,.png,.jpg"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Upload Dropzone Banner */}
          <div className="border-2 border-dashed border-surface-border hover:border-primary/50 bg-surface/40 rounded-3xl p-8 text-center transition-colors flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-light border border-surface-border flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-primary-light" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Hujjatlaringizni bu yerga tashlang yoki tanlang
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              PDF, DOCX, TXT, CSV, JSON (Maksimal hajm: 25 MB)
            </p>
          </div>

          {/* Document List */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white">
              Yuklangan Hujjatlar ({files.length})
            </h2>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Yuklanmoqda...
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 bg-surface rounded-2xl border border-surface-border text-center text-xs text-zinc-400">
                Hozircha hech qanday hujjat yuklanmagan. Yuqoridagi tugma orqali fayl yuklang.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary-light" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-zinc-100 truncate">
                            {file.file_name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {file.file_type.toUpperCase()} • {(file.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMutation.mutate(file.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-surface-light transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {file.summary && (
                      <p className="text-xs text-zinc-400 line-clamp-2 italic bg-surface-dark/50 p-2.5 rounded-xl border border-surface-border/40">
                        "{file.summary}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-surface-border/50">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={() => {
                          setSelectedFile(file);
                          setAnalysisResult(null);
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary-light" />
                        <span>AI Tahlil</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 text-xs"
                        onClick={() => handleChatWithFile(file)}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chatda ishlatish</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deep Analysis Modal */}
        <Modal
          isOpen={!!selectedFile}
          onClose={() => {
            setSelectedFile(null);
            setAnalysisResult(null);
          }}
          title={selectedFile ? `Hujjat Tahlili: ${selectedFile.file_name}` : 'Tahlil'}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleRunAnalysis('summary')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  analysisMode === 'summary'
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-surface-dark border-surface-border text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-primary-light" />
                <span>Qisqacha Mazmun</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAnalysis('key_points')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  analysisMode === 'key_points'
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-surface-dark border-surface-border text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                <span>Asosiy Bandlar</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAnalysis('translate')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  analysisMode === 'translate'
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-surface-dark border-surface-border text-zinc-400 hover:text-white'
                }`}
              >
                <Languages className="w-4 h-4 text-accent-pink" />
                <span>Tarjima & Tahlil</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAnalysis('qa')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  analysisMode === 'qa'
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-surface-dark border-surface-border text-zinc-400 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4 text-accent-cyan" />
                <span>Savol-Javob</span>
              </button>
            </div>

            {analysisMode === 'qa' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Ushbu hujjat bo'yicha savolingizni yozing..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleRunAnalysis('qa')}
                  isLoading={isAnalyzing}
                >
                  Javob Olish
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="py-8 text-center text-xs text-zinc-400 animate-pulse">
                Hujjat sun'iy intellekt tomonidan o'rganilmoqda va tahlil qilinmoqda...
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="p-4 rounded-2xl bg-surface-dark border border-surface-border text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {analysisResult}
              </div>
            )}
          </div>
        </Modal>
      </main>
    </div>
  );
};
