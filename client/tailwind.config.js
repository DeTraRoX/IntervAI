/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0b0f19",
        glassBg: "rgba(17, 25, 40, 0.75)",
        glassBorder: "rgba(255, 255, 255, 0.125)",
        brandPrimary: "#3b82f6",
        brandSecondary: "#8b5cf6",
        neonCyan: "#06b6d4"
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"]
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
