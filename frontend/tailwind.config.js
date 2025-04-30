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

    keyframes: {
      borderShine: {
        '0%':   { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
      textShine: {
        '0%':   { 'background-position': '0% 50%' },
        '100%': { 'background-position': '200% 50%' },
      },
    },
    animation: {
      'once-border-shine': 'borderShine 1s ease-out forwards',
      'once-text-shine':   'textShine   1.5s ease-out forwards',
    },
    backgroundImage: {
      'shine-text':
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
    },
    backgroundSize: {
      '300%': '300% auto',
    },
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
    require('@tailwindcss/aspect-ratio'),
  ],
}
