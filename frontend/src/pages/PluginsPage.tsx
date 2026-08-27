import React, { useState } from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import {
  Plug,
  Globe,
  Code2,
  Database,
  Github,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
  version: string;
}

const INITIAL_PLUGINS: Plugin[] = [
  {
    id: 'web_search',
    name: 'Real-time Web Search',
    category: 'Internet',
    description: 'AI modeliga real vaqtdagi internet qidiruvi va dolzarb ma\'lumotlarni ulash.',
    icon: <Globe className="w-5 h-5 text-accent-cyan" />,
    isEnabled: true,
    version: 'v2.4',
  },
  {
    id: 'code_interpreter',
    name: 'Python Code Sandbox',
    category: 'Developer Tools',
    description: 'AI tomonidan yozilgan Python kodlarini xavfsiz izolyatsiyalangan muhitda bajarish va natijasini ko\'rish.',
    icon: <Code2 className="w-5 h-5 text-primary-light" />,
    isEnabled: true,
    version: 'v3.1',
  },
  {
    id: 'sql_connector',
    name: 'SQL Database Explorer',
    category: 'Data Analysis',
    description: 'PostgreSQL, MySQL va SQLite ma\'lumotlar bazalariga ulanib avtomatik so\'rovlar generatsiya qilish.',
    icon: <Database className="w-5 h-5 text-accent-emerald" />,
    isEnabled: false,
    version: 'v1.2',
  },
  {
    id: 'github_sync',
    name: 'GitHub Repository Sync',
    category: 'Integrations',
    description: 'GitHub omboringizdagi repo kodlarini o\'qish, PR review qilish va commitlar tarixi bo\'yicha suhbat.',
    icon: <Github className="w-5 h-5 text-zinc-100" />,
    isEnabled: true,
    version: 'v2.0',
  },
];

export const PluginsPage: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>(INITIAL_PLUGINS);

  const togglePlugin = (id: string) => {
    setPlugins(
      plugins.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 md:p-10 relative">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="border-b border-surface-border pb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-primary to-accent-cyan text-white shadow-lg shadow-primary/20">
                <Plug className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Plaginlar & MCP Integratsiyalar
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  WEN AI imkoniyatlarini internet qidiruvi, kod ijrochisi va ma'lumotlar bazalari bilan kengaytiring.
                </p>
              </div>
            </div>
          </div>

          {/* Plugins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                className="p-6 rounded-3xl bg-surface/75 border border-surface-borderLight hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-surface-dark border border-surface-border">
                      {plugin.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{plugin.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-primary-light font-semibold">
                          {plugin.category}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {plugin.version}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePlugin(plugin.id)}
                    className="p-1 rounded-xl text-zinc-300 hover:text-white transition-transform active:scale-95"
                    title={plugin.isEnabled ? "O'chirish" : "Yoqish"}
                  >
                    {plugin.isEnabled ? (
                      <ToggleRight className="w-8 h-8 text-primary-neon" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-zinc-600" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {plugin.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs">
                  <span
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      plugin.isEnabled ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        plugin.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                      }`}
                    />
                    {plugin.isEnabled ? 'Faollashtirilgan' : 'O\'chirilgan'}
                  </span>

                  <span className="text-[11px] text-zinc-500 font-medium">
                    Auto-MCP Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
