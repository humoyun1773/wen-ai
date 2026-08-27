/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#08080C",
        surface: {
          DEFAULT: "#121218",
          light: "#1C1C24",
          lighter: "#262632",
          dark: "#0B0B10",
          border: "rgba(255, 255, 255, 0.08)",
          borderLight: "rgba(255, 255, 255, 0.15)",
        },
        primary: {
          DEFAULT: "#7928CA",
          hover: "#8E3DEC",
          light: "#A855F7",
          dark: "#5B16A6",
          neon: "#B347FF",
        },
        secondary: {
          DEFAULT: "#0070F3",
          hover: "#1E86FF",
          light: "#00DFD8",
          dark: "#0051B3",
        },
        accent: {
          cyan: "#00F0FF",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#FF007A",
          violet: "#8B5CF6",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #7928CA 0%, #FF007A 50%, #0070F3 100%)',
        'neon-glow': 'radial-gradient(circle, rgba(121,40,202,0.15) 0%, rgba(0,0,0,0) 70%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
