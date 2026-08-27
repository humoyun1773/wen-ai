import React, { useState } from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { CodeBlock } from '@/shared/components/CodeBlock';
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCcw,
  Bug,
  Lightbulb,
  FileCode,
} from 'lucide-react';

const INITIAL_CODE = `# WEN AI Codex — Python Sandbox
import asyncio
from typing import List

async def calculate_ai_embeddings(texts: List[str]) -> dict:
    """Simulate high-speed embedding calculation."""
    print(f"Processing {len(texts)} chunks through neural vector space...")
    await asyncio.sleep(0.5)
    return {
        "status": "success",
        "vectors_generated": len(texts),
        "dimensions": 1536
    }

# Test execution
asyncio.run(calculate_ai_embeddings(["FastAPI", "React", "TypeScript", "RAG Engine"]))
`;

export const CodexPage: React.FC = () => {
  const [code, setCode] = useState(INITIAL_CODE);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Kompilyatsiya qilinmoqda va ishga tushirilmoqda...\n');
    setTimeout(() => {
      setOutput(
        'Processing 4 chunks through neural vector space...\n' +
        'Output: {\'status\': \'success\', \'vectors_generated\': 4, \'dimensions\': 1536}\n' +
        'Process finished with exit code 0 (Execution time: 0.52s)'
      );
      setIsRunning(false);
    }, 600);
  };

  const handleExplain = () => {
    setAiExplanation(
      '🧠 **AI Codex Tahlili:**\n' +
      '- Ushbu kod asinxron (`async/await`) funksiya orqali matnlarni vektorli fazoga o\'tkazishni simulyatsiya qiladi.\n' +
      '- `asyncio.run()` yordamida `calculate_ai_embeddings` hodisalar tsiklida (event loop) ishga tushirilgan.\n' +
      '- 1536 o\'lchamli zamonaviy matnli embeddinglar OpenAI va Cohere modellari standartlariga mos keladi.'
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 relative">
        <div className="max-w-6xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-primary to-accent-cyan text-white shadow-lg shadow-primary/20">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  WEN — AI Developer Studio & Sandbox
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Interaktiv kod muharriri, xatolarni tuzatish va sun'iy intellekt tahlili.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-surface-dark border border-surface-border rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-primary font-mono"
              >
                <option value="python">Python 3.12</option>
                <option value="typescript">TypeScript 5.4</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="sql">PostgreSQL / SQL</option>
              </select>

              <Button
                size="sm"
                variant="secondary"
                onClick={handleExplain}
                className="text-xs py-2 px-3 rounded-xl"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Kodni Tushuntir</span>
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={handleRun}
                isLoading={isRunning}
                className="text-xs py-2 px-4 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Ishga Tushirish</span>
              </Button>
            </div>
          </div>

          {/* Editor & Console Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Code Input Window */}
            <div className="lg:col-span-7 flex flex-col rounded-3xl bg-[#0b0b10] border border-surface-border overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface-dark border-b border-surface-border text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-zinc-300 font-semibold">main.py</span>
                </div>
                <span className="text-[10px] uppercase text-primary-light">Interactive REPL</span>
              </div>

              <textarea
                rows={16}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-xs sm:text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed selection:bg-primary/30"
                spellCheck={false}
              />
            </div>

            {/* Terminal Output Window */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="rounded-3xl bg-[#0b0b10] border border-surface-border overflow-hidden shadow-2xl flex flex-col h-64">
                <div className="flex items-center justify-between px-4 py-2.5 bg-surface-dark border-b border-surface-border text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-accent-emerald" />
                    <span>Terminal Console</span>
                  </div>
                  {output && (
                    <button
                      onClick={() => setOutput('')}
                      className="text-[10px] text-zinc-500 hover:text-white"
                    >
                      Tozalash
                    </button>
                  )}
                </div>

                <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {output || (
                    <span className="text-zinc-600 italic">
                      Kod natijasi bu yerda ko'rinadi. "Ishga Tushirish" tugmasini bosing...
                    </span>
                  )}
                </div>
              </div>

              {/* AI Explanation Box */}
              {aiExplanation && (
                <div className="p-4 rounded-3xl bg-surface/80 border border-primary/40 text-xs text-zinc-200 leading-relaxed shadow-xl animate-in fade-in duration-200">
                  <div className="whitespace-pre-wrap">{aiExplanation}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
