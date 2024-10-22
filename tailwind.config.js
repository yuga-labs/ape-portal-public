/** @type {import("tailwindcss").Config} */
export default {
  content: ['./lib/**/*.{html,js,ts,jsx,tsx}'],
  prefix: 'aw-',
  theme: {
    extend: {
      fontFamily: {
        dmmono: ['DMMono'],
        dmsans: ['DMSans'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      colors: {
        apeBlue: '#0246cd',
        apeAccent: '#0054FA',
        apeDarkBlue: '#002876',
        apeCtaBlue: '#002D87',
        apeCtaBlueDisabled: '#01207E',
        apeCtaTextDisabled: '#528CFF',
        'ape-blue-700': '#0036AD',
        warning: '#FFB155',
        danger: '#FF8080',
      },
      backgroundImage: {
        'gradient-lavender-coral-sunset':
          'linear-gradient(to right, #A281FF, #EB8280, #EBBF9A, #89D0FF)',
        'ape-portal-logo': 'linear-gradient(180deg, #0036AD 0%, #00299A 100%)',
        'tab-button-selected':
          'linear-gradient(180deg, #2660D4 0%, #1558DE 100%)',
      },
      boxShadow: {
        custom: '0px 11px 15px 11px rgba(41, 113, 255, 0.23)',
        'tab-header': '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
        'tab-button': '0px 1px 0px 0px #0045D4 inset',
        'tab-button-selected': 'inset 0 1px 0 #5890FF, inset 0 -1px 0 #5890FF',
      },
      zIndex: {
        100: '100',
        60: '60',
      },
    },
  },
  // eslint-disable-next-line unicorn/prefer-module
  plugins: [require('tailwindcss-animate'), require('tailwind-scrollbar')],
};
