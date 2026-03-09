/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#232f3e',
        accent: '#ff9900',
        'amazon-orange': '#ff9900',
        'amazon-dark': '#131921',
        'amazon-blue': '#37475a',
        'amazon-light': '#febd69',
      },
      fontFamily: {
        sans: ['Amazon Ember', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
