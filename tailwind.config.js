/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['TT Fors Trial', 'TT Fors', 'system-ui', 'sans-serif'],
        heading: ['Vacuum', 'Vacuum Alt', 'sans-serif'],
      },
    },
  },
  safelist: ['dashboard-container'],
  plugins: [],
}
