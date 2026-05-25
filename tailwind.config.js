/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['TT Fors Trial', 'TT Fors', 'system-ui', 'sans-serif'],
        heading: ['Vacuum', 'Vacuum Alt', 'sans-serif'],
      },
    },
  },

  // Consistent full-width scaled wrapper used across dashboard + header
  // Usage: className="dashboard-container"
  safelist: ['dashboard-container'],
  plugins: [],
}
