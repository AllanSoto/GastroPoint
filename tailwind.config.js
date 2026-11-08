/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        canvas: '#F8F7F4',
        surface: '#FFFFFF',
        espresso: {
          50: '#FBF9F6',
          100: '#F5F0EA',
          200: '#E8DFD3',
          600: '#8C5A32',
          700: '#6F4524',
          800: '#4A2E18',
          900: '#291B0F',
        }
      },
    },
  },
  plugins: [],
}
