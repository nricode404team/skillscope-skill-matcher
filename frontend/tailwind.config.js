/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        matched: '#22c55e',
        missing: '#ef4444',
        partial: '#eab308',
      },
    },
  },
  plugins: [],
}
