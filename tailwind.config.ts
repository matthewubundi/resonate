import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./views/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.{js,ts,jsx,tsx,mdx}", // Include root files like App.tsx
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        paper: '#FFFFFF',
        ink: {
          DEFAULT: '#111111',
          light: 'rgba(17, 17, 17, 0.7)',
          faint: 'rgba(17, 17, 17, 0.1)'
        },
        paleslate: {
          DEFAULT: '#F1F5F9',
          dark: '#E2E8F0',
        },
        azure: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
          faint: 'rgba(37, 99, 235, 0.1)'
        },
        highlight: { // Yellow
          DEFAULT: '#EAB308',
          light: '#FEF9C3',
        },
        gunmetal: {
          DEFAULT: '#1E1E2E',
          light: '#2A2A3C', // Optional lighter shade for contrast if needed
        },
        mint: {
          DEFAULT: '#4ADE80',
          hover: '#22C55E'
        }
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scan': {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'scan': 'scan 3s ease-in-out infinite',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'zoom-in': 'zoom-in 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Plugin for 3D transforms
    function ({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.perspective-1000': {
          'perspective': '1000px',
        },
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
        '.rotate-y-12': {
          'transform': 'rotateY(12deg)',
        },
        '.rotate-y-0': {
          'transform': 'rotateY(0deg)',
        },
      })
    }
  ],
};
export default config;
