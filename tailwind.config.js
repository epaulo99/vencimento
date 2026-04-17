/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(15,23,42,0.06), 0 10px 25px rgba(15,23,42,0.12)'
      },
      keyframes: {
        pulseHard: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.03)', opacity: '1' }
        }
      },
      animation: {
        pulseHard: 'pulseHard 1s infinite'
      }
    }
  },
  plugins: []
};