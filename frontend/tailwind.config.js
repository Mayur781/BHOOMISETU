/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f2942',       // Ashoka Deep Navy
          navyLight: '#183b5e',
          navyDark: '#081726',
          saffron: '#f58220',    // India Saffron / Amber
          saffronLight: '#ff9933',
          saffronDark: '#d96c09',
          green: '#138808',      // India Emerald Green
          greenLight: '#1faa0e',
          greenDark: '#0b5a04',
          slate: '#0f172a',
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 2px 4px 0 rgba(15, 41, 66, 0.06), 0 1px 2px 0 rgba(15, 41, 66, 0.04)',
        'gov-md': '0 4px 6px -1px rgba(15, 41, 66, 0.1), 0 2px 4px -1px rgba(15, 41, 66, 0.06)',
        'gov-lg': '0 10px 15px -3px rgba(15, 41, 66, 0.1), 0 4px 6px -2px rgba(15, 41, 66, 0.05)',
      }
    },
  },
  plugins: [],
}
