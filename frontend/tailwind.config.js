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
        background: "#09090B",
        surface: {
          DEFAULT: "#18181B",
          light: "#27272A",
          dark: "#121215",
          border: "#2E2E34"
        },
        primary: {
          DEFAULT: "#7000FF",
          hover: "#8524FF",
          light: "#9D54FF",
          dark: "#5700C7",
        },
        secondary: {
          DEFAULT: "#A855F7",
          hover: "#B66EF8",
        },
        accent: {
          blue: "#3B82F6",
          cyan: "#06B6D4",
          pink: "#EC4899",
          emerald: "#10B981"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
