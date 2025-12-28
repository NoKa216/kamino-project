/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], 
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        kamino: {
          violet: '#8B5CF6',
          dark: '#1E1B4B',
          light: '#F5F3FF',
        },
      },
    },
  },
  plugins: [],
}