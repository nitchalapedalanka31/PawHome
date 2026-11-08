/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#F0F9F8',
          100: '#D9F3EF', // Secondary Light Teal
          200: '#B2E7DF',
          300: '#7CD4C7',
          400: '#3BBBAA',
          500: '#008F8C', // Primary Teal
          600: '#007A78',
          700: '#006260',
          800: '#024D4C',
          900: '#04403F',
          950: '#012424',
        },
        pawBg: '#F7FAF9',
        pawText: '#243333',
        pawMuted: '#586E6E',
        pawBorder: '#E1EBE8',
        pawAccent: '#10B981',
        pawWarning: '#F97316',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 143, 140, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 36, 36, 0.06), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'hover': '0 12px 28px -4px rgba(0, 143, 140, 0.15), 0 6px 12px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
