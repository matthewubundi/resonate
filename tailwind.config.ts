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
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
