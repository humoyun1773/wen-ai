import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import {
  BookOpen,
  Search,
  Bookmark,
  Code,
  FileText,
  Trash2,
  Sparkles,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';

const SAMPLE_SAVED = [
  {
    id: '1',
    title: 'FastAPI Async Session & Dependency Injection Pattern',
    category: 'Code',
    content: 'from sqlalchemy.ext.asyncio import AsyncSession\n\nasync def get_db() -> AsyncGenerator[AsyncSession, None]:\n    async with AsyncSessionLocal() as session:\n        yield session',
    date: '2026-08-27',
  },
  {
    title: 'O\'zbekiston Fuqarolik Kodeksi Shartnoma Moddalari',
    id: '2',
    category: 'Document',
    content: 'Shartnoma tuzish tartibi, tomonlarning huquq va majburiyatlari hamda javobgarlik shartlari tahlili.',
    date: '2026-08-25',
  },
  {
    title: 'Clean Architecture Folder Structure Standard',
    id: '3',
    category: 'Architecture',
    content: 'API -> Service Layer -> Repository Layer -> Database Model. Business logic controllers ichida yozilmasligi kerak.',
    date: '2026-08-20',
  },
];

export const LibraryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState(SAMPLE_SAVED);
  const navigate = useNavigate();

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 md:p-10 relative">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-accent-cyan to-primary text-white shadow-lg shadow-cyan-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Bilimlar Kutubxonasi (Library)
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Saqlab olingan AI javoblari, kod bloklari, promptlar va hujjatlar arxivi.
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Kutubxonadan izlash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-surface-border rounded-2xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-surface/70 border border-surface-borderLight hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-md hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-primary/15 text-primary-light border border-primary/25">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                </div>

                <div className="p-3.5 bg-surface-dark/70 rounded-2xl border border-surface-border/50 text-xs text-zinc-300 font-mono line-clamp-3 leading-relaxed">
                  {item.content}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary-light hover:bg-primary/10 text-xs py-1.5 px-3 rounded-xl"
                    onClick={() => navigate('/chat')}
                  >
                    <span>Chatda ochish</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>

                  <button
                    onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-surface-light rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
