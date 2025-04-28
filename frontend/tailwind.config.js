/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand:       "#4872db",
        brand2:      "#849cd6",
        brandlight:  "#adbbde",
        brandlight2: "#c8cedf",
        white: "#f9fcff",
        white2: "#e3e4da",
      },
    },

    linearGradientColors: theme => ({
      brand:      [theme("colors.brand"),      theme("colors.brand2")],
      brandlight: [theme("colors.brandlight"), theme("colors.brandlight2")],
      gray:       [theme("colors.gray.300"),   theme("colors.gray.100")],
      darkGray:       [theme("colors.gray.800"),   theme("colors.gray.400")],
      white:       [theme("colors.white"),  theme("colors.white2")],
    }),

    // для радиального
    radialGradientColors: theme => ({
      brand:      [theme("colors.brand"),      theme("colors.brand2")],
      brandlight: [theme("colors.brandlight"), theme("colors.brandlight2")],
      gray:       [theme("colors.gray.400"),   theme("colors.gray.100")],
      darkGray:       [theme("colors.gray.500"),   theme("colors.gray.300")],
      white:       [theme("colors.white"),  theme("colors.white2")],
    }),

    // для конического
    conicGradientColors: theme => ({
      brand:      [theme("colors.brand"),      theme("colors.brand2")],
      brandlight: [theme("colors.brandlight"), theme("colors.brandlight2")],
      gray:       [theme("colors.gray.400"),   theme("colors.gray.100")],
      darkGray:       [theme("colors.gray.500"),   theme("colors.gray.300")],
      white:       [theme("colors.white"),  theme("colors.white2")],
    }),
  },
  variants: {
    backgroundImage:           ['responsive'],
    linearGradients:           ['responsive'],
    radialGradients:           ['responsive'],
    conicGradients:            ['responsive'],
    repeatingLinearGradients:  ['responsive'],
    repeatingRadialGradients:  ['responsive'],
    repeatingConicGradients:   ['responsive'],
  },
  plugins: [
    require('tailwindcss-gradients'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
