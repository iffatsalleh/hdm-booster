/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        accent: '#f97316',
        dark: '#0f172a',
        success: '#16a34a',
        highlight: '#facc15',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Quicksand', 'sans-serif'],
        num: ['Inter', 'sans-serif'],
      },
    },
  },
  // hdm.css (design/mockups) has its own reset; preflight would override mockup styles.
  corePlugins: { preflight: false },
  plugins: [],
};
