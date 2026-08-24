/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#263238',
          light: '#455A64',
          dark: '#172126',
        },
        gold: {
          DEFAULT: '#FF6D00',
          light: '#FFB74D',
          dark: '#E65100',
        },
        maroon: {
          DEFAULT: '#EF5350',
          dark: '#C62828',
        },
          cream: '#F5F7FA',
          ink: '#263238',
          muted: '#60727B',
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Poppins"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
          'ribbon': "linear-gradient(135deg, #FF6D00 0%, #E65100 100%)",
      },
    },
  },
  plugins: [],
}
