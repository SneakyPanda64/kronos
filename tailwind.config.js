/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        's-blue': '#7289DA',
        's-light-gray': '#6f747a',
        's-gray': '#282B30',
        's-dark-gray': '#1E2124',
        's-purple': '#8C60C4',
        's-nav': '#2b2a33',
        's-dark-blue': '#86a5b1'
      }
    }
  },
  plugins: [require('tailwind-scrollbar')]
}
