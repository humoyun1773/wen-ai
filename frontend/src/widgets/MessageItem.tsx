import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { CodeBlock } from '@/shared/components/CodeBlock';
import { Bot, User as UserIcon, Copy, Check, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface MessageItemProps {
  message: Partial<Message>;
  isStreaming?: boolean;
  onRetry?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
  onRetry,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopyMessage = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = message.content?.replace(/```[\s\S]*?```/g, 'Kod bloki') || '';
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`group flex gap-4 w-full max-w-4xl mx-auto py-5 px-4 md:px-6 transition-all rounded-3xl ${
        isUser
          ? 'bg-surface/30 border border-white/[0.04]'
          : 'bg-surface/70 border border-surface-borderLight shadow-lg backdrop-blur-md'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
          isUser
            ? 'bg-zinc-800 text-zinc-300 border border-surface-border'
            : 'bg-gradient-to-tr from-primary via-primary-light to-secondary text-white shadow-primary/30'
        }`}
      >
        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {isUser ? 'Вы' : 'WEN AI'}
            </span>
            {!isUser && (
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary-light border border-primary/30">
                Ассистент
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isSpeaking
                  ? 'text-primary-light bg-primary/20'
                  : 'text-zinc-400 hover:text-white hover:bg-surface-light'
              }`}
              title="Озвучить"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleCopyMessage}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-all text-xs flex items-center gap-1"
              title="Скопировать"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Markdown Render Area */}
        <div className="prose prose-invert max-w-none text-sm text-zinc-200 leading-relaxed break-words font-sans">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                return !inline && match ? (
                  <CodeBlock
                    language={match[1]}
                    value={codeString}
                  />
                ) : (
                  <code
                    className="bg-surface-light px-2 py-0.5 rounded-lg text-primary-light font-mono text-xs border border-surface-border font-medium"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-7 text-zinc-200">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 mb-3 text-zinc-300">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 mb-3 text-zinc-300">{children}</ol>,
              li: ({ children }) => <li className="text-zinc-200">{children}</li>,
              h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 mt-4 tracking-tight">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold text-white mb-2 mt-3 tracking-tight">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2 mt-2">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-zinc-400 my-3 bg-surface-dark/40 py-2 rounded-r-xl">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 border border-surface-border rounded-2xl bg-surface-dark/50">
                  <table className="w-full text-left text-xs border-collapse">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="bg-surface-light px-4 py-3 font-semibold text-zinc-200 border-b border-surface-border">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 border-b border-surface-border/50 text-zinc-300">
                  {children}
                </td>
              ),
            }}
          >
            {message.content || ''}
          </ReactMarkdown>

          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-primary-neon animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
};
