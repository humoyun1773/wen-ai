import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-surface-border bg-[#0d0d10] font-mono text-sm group">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-dark border-b border-surface-border text-xs text-zinc-400">
        <span className="font-semibold uppercase tracking-wider text-primary-light">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-light/50 hover:bg-surface-light text-zinc-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Nusxa olindi!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Nusxa olish</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-zinc-200 leading-relaxed">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};
