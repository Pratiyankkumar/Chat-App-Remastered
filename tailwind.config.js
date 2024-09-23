/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      backgroundColor: {
        'background': '#111827',
        'chat-background': '#06483E'
      },
      fontSize: {
        'xsm': '10px'
      }
    },
  },
  plugins: [],
};


