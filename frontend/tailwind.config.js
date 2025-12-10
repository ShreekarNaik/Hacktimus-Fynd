/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#f0f4f8',
        'panel-bg': '#fff9e6',
        'panel-border': '#8c7ae6',
        'btn-green-top': '#2ecc71',
        'btn-green-bottom': '#27ae60',
        'btn-green-shadow': '#1e8449',
        'btn-blue-top': '#3498db',
        'btn-blue-bottom': '#2980b9',
        'btn-blue-shadow': '#1c5980',
        'text-stroke': '#2c3e50',
      },
      fontFamily: {
        'titan': ['"Titan One"', 'cursive'],
        'nunito': ['"Nunito"', 'sans-serif'],
      },
       animation: {
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'float-up': 'floatUp 0.8s ease-out forwards',
        'shake': 'shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0' },
          '20%': { transform: 'translateY(-10px) scale(1.2)', opacity: '1' },
          '100%': { transform: 'translateY(-80px) scale(1)', opacity: '0' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-2px, 1px, 0)' },
          '20%, 80%': { transform: 'translate3d(3px, -1px, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-5px, 2px, 0)' },
          '40%, 60%': { transform: 'translate3d(5px, -2px, 0)' },
        }
      }
    },
  },
  plugins: [],
}
