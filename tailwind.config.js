/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#173B5F',
          light: '#3A5D82',
          dark: '#102B46',
        },
        gold: {
          DEFAULT: '#F3B93D',
          light: '#F8D77C',
          dark: '#D29416',
        },
        maroon: {
          DEFAULT: '#BB6C49',
          dark: '#8D4D30',
        },
        cream: '#F7F3EA',
        ivory: '#FFFDF8',
        ink: '#1B2E45',
        muted: '#607382',
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Poppins"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        ribbon: "linear-gradient(135deg, #F3B93D 0%, #D29416 100%)",
      },
      boxShadow: {
        soft: '0 12px 30px rgba(23, 59, 95, 0.10)',
      },
    },
  },
  plugins: [],
}
