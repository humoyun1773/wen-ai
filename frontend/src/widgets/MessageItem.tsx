import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { CodeBlock } from '@/shared/components/CodeBlock';
import { Bot, User as UserIcon, Copy, Check, Sparkles } from 'lucide-react';

interface MessageItemProps {
  message: Partial<Message>;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div
      className={`group flex gap-4 w-full max-w-4xl mx-auto py-6 px-4 md:px-6 transition-colors rounded-2xl ${
        isUser ? 'bg-transparent' : 'bg-surface/50 border border-surface-border/50 shadow-sm'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
          isUser
            ? 'bg-zinc-800 text-zinc-300 border border-surface-border'
            : 'bg-gradient-to-tr from-primary to-secondary text-white shadow-primary/20'
        }`}
      >
        {isUser ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {isUser ? 'Siz' : 'WEN AI'}
            </span>
            {!isUser && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20">
                <Sparkles className="w-2.5 h-2.5" />
                Assistant
              </span>
            )}
          </div>

          <button
            onClick={handleCopyMessage}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-all text-xs flex items-center gap-1"
            title="Nusxa olish"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Render Markdown or plain content */}
        <div className="prose prose-invert max-w-none text-sm text-zinc-200 leading-relaxed break-words">
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
                    className="bg-surface-light px-1.5 py-0.5 rounded text-primary-light font-mono text-xs border border-surface-border"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-7">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 mb-3">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 mb-3">{children}</ol>,
              li: ({ children }) => <li className="text-zinc-200">{children}</li>,
              h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-2 mt-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2 mt-2">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-zinc-400 my-2">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 border border-surface-border rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="bg-surface-light p-2.5 font-semibold text-zinc-200 border-b border-surface-border">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="p-2.5 border-b border-surface-border/50 text-zinc-300">
                  {children}
                </td>
              ),
            }}
          >
            {message.content || ''}
          </ReactMarkdown>

          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
