import React, { useState } from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  UploadCloud,
  Wand2,
  Maximize2,
  RefreshCw,
  Layers,
  Palette,
} from 'lucide-react';

const PRESET_STYLES = [
  { id: 'photorealistic', name: 'Fotorealistik', desc: '8k ultra realism, cinematic' },
  { id: 'anime', name: 'Anime & Manga', desc: 'Makoto Shinkai style, vibrant' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Futuristic night city, glowing' },
  { id: '3d_render', name: '3D Render', desc: 'Octane render, unreal engine 5' },
  { id: 'minimalist', name: 'Minimalist Vector', desc: 'Clean lines, flat art' },
];

const SAMPLE_GALLERY = [
  {
    id: '1',
    prompt: 'Futuristic AI neural network city with neon purple skyline',
    style: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    prompt: 'Cozy cyberpunk developer workspace with holographic displays',
    style: 'Photorealistic',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    prompt: 'Abstract quantum computing algorithm visualization',
    style: '3D Render',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  },
];

export const ImagesPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState(SAMPLE_GALLERY);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newImg = {
        id: Date.now().toString(),
        prompt: prompt,
        style: selectedStyle,
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      };
      setGallery([newImg, ...gallery]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-grid-pattern text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 md:p-10 relative">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="border-b border-surface-border pb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-primary to-accent-rose text-white shadow-lg shadow-primary/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  AI Rasmlar & Vision Studio
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Matn orqali yangi rasmlar yarating va mavjud rasmlarni sun'iy intellekt yordamida tahlil qiling.
                </p>
              </div>
            </div>
          </div>

          {/* Generator Input Card */}
          <div className="p-6 rounded-3xl bg-surface/75 border border-surface-borderLight shadow-2xl backdrop-blur-md space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Rasm Tavsifi (Prompt)
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Masalan: Futuristic neon glowing cyberpunk robot programming in dark room, 8k ultra detailed..."
                  className="w-full bg-surface-dark border border-surface-border rounded-2xl p-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Style Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Vizual Uslub (Style)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {PRESET_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedStyle === st.id
                        ? 'bg-primary/20 border-primary text-white shadow-md'
                        : 'bg-surface-dark/70 border-surface-border text-zinc-400 hover:text-white hover:bg-surface'
                    }`}
                  >
                    <p className="text-xs font-bold truncate">{st.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{st.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-surface-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Format:</span>
                {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      aspectRatio === ratio
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-surface-dark text-zinc-400 hover:text-white border border-surface-border'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                isLoading={isGenerating}
                className="py-3 px-8 rounded-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-secondary text-xs shadow-lg shadow-primary/30"
              >
                <Wand2 className="w-4 h-4" />
                <span>RASM YARATISH</span>
              </Button>
            </div>
          </div>

          {/* Generated Gallery */}
          <div className="space-y-4 pt-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary-light" />
              <span>Yaratilgan Rasmlar Galereyasi</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-3xl overflow-hidden bg-surface border border-surface-border shadow-xl hover:border-primary/50 transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <span className="text-[9px] uppercase font-bold text-primary-light">
                      {img.style}
                    </span>
                    <p className="text-xs text-white line-clamp-2 mt-1">{img.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
