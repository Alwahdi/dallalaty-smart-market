/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./index.ts",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c4972a',
          light: '#d4aa3d',
          dark: '#a67d1e',
          foreground: '#1a1408',
          glow: '#d4aa3d',
        },
        secondary: {
          DEFAULT: '#6b7a45',
          foreground: '#faf8f0',
        },
        background: {
          DEFAULT: '#faf8f0',
          dark: '#161210',
        },
        foreground: {
          DEFAULT: '#2d2519',
          dark: '#f5f0e0',
        },
        card: {
          DEFAULT: '#f8f5eb',
          dark: '#1f1a14',
          foreground: '#2d2519',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fef2f2',
        },
        muted: {
          DEFAULT: '#eeead8',
          foreground: '#78705e',
          dark: '#2a241c',
        },
        accent: {
          DEFAULT: '#d4dbb8',
          foreground: '#3d4528',
          dark: '#2a3018',
        },
        border: {
          DEFAULT: '#e0dac8',
          dark: '#3a3228',
        },
        input: {
          DEFAULT: '#f0ecdc',
          dark: '#2a241c',
        },
      },
      fontFamily: {
        arabic: ['Cairo'],
      },
      borderRadius: {
        lg: 12,
        md: 10,
        sm: 8,
      },
    },
  },
  plugins: [],
};
