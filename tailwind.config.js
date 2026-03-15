/** @type {import('tailwindcss').Config} */
module.exports = {
  // Change this line to 'class' strategy
  content: [
    './src/**/*.{html,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app-bg': 'var(--color-bg)',
        'app-text': 'var(--color-text)',
        'app-blue': 'var(--color-blue)',
      },
    },
  },
  plugins: [],
};
