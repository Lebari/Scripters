/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  purge: [],
  theme: {
    extend:{
      colors: {
        red: '#DA2C38',
        brown: '#43291F',
        cream: '#F4F0BB',
        offwhite: '#FFFFF0',
        offwhite_grey: '#C9C8BC',
        green: '#226F54',
        green_light: '#87C38F',
        green_offwhite: '#BDCFBC',
      },
      fontSize: {
        xs: '0.8rem',
        sm: '0.9rem',
        base: '1rem',
        xl: '1.25rem',
        '2xl': '1.563rem',
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      }
    }
  },
  variants: {},
  plugins: [],
}
