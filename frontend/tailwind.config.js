/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'love-pink': '#FF6B9D',
        'love-rose': '#FF8FAB',
        'love-red': '#FF1744',
        'love-coral': '#FF7F7F',
        'love-peach': '#FFD1DC',
        'love-lavender': '#E6E6FA',
        'love-cream': '#FFF5F5',
        'love-dark': '#2D1B2E',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}