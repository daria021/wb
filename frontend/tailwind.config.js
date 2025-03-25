/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#4872db',
        brandlight: '#adbbde',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),2
  ],
}

