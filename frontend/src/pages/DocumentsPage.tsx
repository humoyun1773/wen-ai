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
  Brain,
  MessageSquare,
  FileCheck,
  Search,
  BookOpen,
  Languages,
  CheckCircle2,
  Layers,
  ArrowRight,
  Database,
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

  // Fetch files
  const { data: files = [], isLoading } = useQuery<FileAttachment[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await apiClient.get('/files');
      return res.data;
    },
  });

  // Delete file
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
    } catch {
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
    } catch {
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
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  <Database className="w-5 h-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Document AI & RAG Engine
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                PDF, Word (DOCX), CSV va matnli hujjatlarni semantik tahlil qiling va faqat hujjat ichidagi faktlar asosida javob oling.
              </p>
            </div>

            <label className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary via-primary-light to-secondary hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-primary/25 cursor-pointer transition-all active:scale-95 self-start sm:self-auto">
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Yuklanmoqda...' : 'HUJJAT YUKLASH'}</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.doc,.txt,.csv,.json,.png,.jpg"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-surface-borderLight hover:border-primary/60 bg-surface/40 hover:bg-surface/60 rounded-3xl p-10 text-center transition-all duration-300 flex flex-col items-center justify-center group shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-surface-light border border-surface-border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary/40 transition-transform">
              <UploadCloud className="w-8 h-8 text-primary-light" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Hujjatlaringizni bu yerga tashlang yoki tanlang
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              PDF, DOCX, TXT, CSV, JSON (Avtomatik tokenlash va semantik indekslash)
            </p>
          </div>

          {/* Documents Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-light" />
                <span>Indekslangan Hujjatlar ({files.length})</span>
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-zinc-500 animate-pulse">
                Hujjatlar yuklanmoqda...
              </div>
            ) : files.length === 0 ? (
              <div className="p-10 bg-surface/60 rounded-3xl border border-surface-border text-center text-xs text-zinc-400">
                Hozircha hech qanday hujjat yuklanmagan. Yuqoridagi tugma orqali fayl yuklang.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-5 rounded-3xl bg-surface/70 border border-surface-borderLight hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary-light" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {file.file_name}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-1 font-mono uppercase">
                            {file.file_type} • {(file.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMutation.mutate(file.id)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-surface-light transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {file.summary && (
                      <p className="text-xs text-zinc-300 line-clamp-2 italic bg-surface-dark/60 p-3 rounded-2xl border border-surface-border/50">
                        "{file.summary}"
                      </p>
                    )}

                    <div className="flex items-center gap-2.5 pt-2 border-t border-surface-border">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs py-2 rounded-xl"
                        onClick={() => {
                          setSelectedFile(file);
                          setAnalysisResult(null);
                        }}
                      >
                        <Brain className="w-3.5 h-3.5 text-primary-light" />
                        <span>AI Tahlil</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 text-xs py-2 rounded-xl"
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

        {/* Modal: Deep Analysis */}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleRunAnalysis('summary')}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  analysisMode === 'summary'
                    ? 'bg-primary/20 border-primary text-white shadow-md'
                    : 'bg-surface-dark border-surface-border text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-primary-light" />
                <span>Qisqacha Mazmun</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAnalysis('key_points')}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  analysisMode === 'key_points'
                    ? 'bg-primary/20 border-primary text-white shadow-md'
                    : 'bg-surface-dark border-surface-border text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                <span>Asosiy Bandlar</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAnalysis('translate')}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  analysisMode === 'translate'
                    ? 'bg-primary/20 border-primary text-white shadow-md'
                    : 'bg-surface-dark border-surface-border text-zinc-400 hover:text-white'
                }`}
              >
                <Languages className="w-4 h-4 text-accent-rose" />
                <span>Tarjima & Tahlil</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAnalysis('qa')}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  analysisMode === 'qa'
                    ? 'bg-primary/20 border-primary text-white shadow-md'
                    : 'bg-surface-dark border-surface-border text-zinc-400 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4 text-accent-cyan" />
                <span>Savol-Javob</span>
              </button>
            </div>

            {analysisMode === 'qa' && (
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Ushbu hujjat bo'yicha savolingizni yozing..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border rounded-2xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary"
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
              <div className="py-10 text-center text-xs text-zinc-400 animate-pulse font-medium">
                Hujjat sun'iy intellekt tomonidan tahlil qilinmoqda...
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto font-sans">
                {analysisResult}
              </div>
            )}
          </div>
        </Modal>
      </main>
    </div>
  );
};
