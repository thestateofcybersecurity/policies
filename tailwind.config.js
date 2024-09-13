module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          400: '#00d1b2',
          500: '#00c4a7',
          600: '#00b79e',
          700: '#00a896',
        },
        gray: {
          200: '#e0e0e0',
          400: '#a0a0a0',
          700: '#333333',
          800: '#2c2c2c',
          900: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
}
