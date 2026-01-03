/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], 
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        kamino: {
          // Primary brand color (CTAs, highlights, active states). Keeps the 'Tech' aesthetic.
          violet: '#8B5CF6', 
          
          // Primary background. Pure black for high contrast, gradients, and immersive media overlays.
          background: '#000000',
          
          // Secondary surface color (e.g., cards, modals, bottom sheets). Deep grey to distinguish from the true black background.
          surface: '#121212',
          
          // Typography system
          text: '#FFFFFF', // High emphasis text
          textMuted: 'rgba(255, 255, 255, 0.6)', // Medium emphasis / secondary text
        },
      },
    },
  },
  plugins: [],
}