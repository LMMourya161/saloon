module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 50%, 55%)',
        accent: 'hsl(14, 90%, 55%)',
        background: 'hsl(210, 10%, 10%)',
        surface: 'hsl(210, 10%, 15%)',
        text: 'hsl(0, 0%, 95%)',
        muted: 'hsl(0, 0%, 65%)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
