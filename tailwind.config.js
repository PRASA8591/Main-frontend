/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        darkBg: '#050811',
        darkCard: 'rgba(10, 15, 30, 0.7)',
        techTeal: '#00d2ff',
        techTealHover: '#00b8e6',
        neonGreen: '#39ff14',
        neonGreenHover: '#00e676',
        techBlue: '#1e40af',
      },
      boxShadow: {
        glowTeal: '0 0 20px rgba(0, 210, 255, 0.25)',
        glowGreen: '0 0 20px rgba(57, 255, 20, 0.25)',
        glowTealStrong: '0 0 30px rgba(0, 210, 255, 0.45)',
        glowGreenStrong: '0 0 30px rgba(57, 255, 20, 0.45)',
      }
    },
  },
  plugins: [],
}
