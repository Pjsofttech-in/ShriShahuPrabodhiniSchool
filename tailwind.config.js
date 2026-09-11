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
          DEFAULT: 'rgb(237 90 0 / <alpha-value>)',
          light: 'rgb(237 90 0 / <alpha-value>)',
          dark: 'rgb(237 90 0 / <alpha-value>)',
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
        ribbon: "linear-gradient(135deg, rgb(237 90 0) 0%, rgb(237 90 0) 100%)",
      },
      boxShadow: {
        soft: '0 12px 30px rgba(23, 59, 95, 0.10)',
      },
    },
  },
  plugins: [],
}
