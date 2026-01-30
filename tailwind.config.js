/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0f172a',
          card: '#1f2937',
          elevated: '#111827',
        },
        primary: '#3b82f6',
        danger: '#ef4444',
        text: '#f9fafb',
      },
    },
  },
  plugins: [],
};
