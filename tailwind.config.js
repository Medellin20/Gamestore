/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a12',
        paper: '#f5f5f7',
        brand: { 400: '#7c8cff', 500: '#5b63f5', 600: '#4a45e0', 700: '#3b34c2' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Inter', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'none' } },
        pop: { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'none' } },
        glow: { '0%,100%': { opacity: 0.55 }, '50%': { opacity: 0.9 } },
      },
      animation: { rise: 'rise .5s ease-out both', pop: 'pop .18s ease-out both', glow: 'glow 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
