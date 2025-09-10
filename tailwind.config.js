/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3881D4',
          'primary-hover': '#2c6bb8',
          'primary-light': '#e3f2fd',
          'primary-dark': '#1e5a9c',
        },
      },
    },
  },
  plugins: [],
}
