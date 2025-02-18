/** @type {import("tailwindcss").Config} */
export default {
  content: [
    './lib/**/*.{html,js,ts,jsx,tsx}',
    './example/**/*.{html,js,ts,jsx,tsx}',
  ],
  prefix: 'aw-',
  darkMode: 'selector',
  plugins: [
    // eslint-disable-next-line unicorn/prefer-module,@typescript-eslint/no-var-requires
    require('tailwindcss-themer')({
      defaultTheme: {
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
            primary: '#0246cd',
            accent: '#0054FA',
            primaryDark: '#002876',
            primaryLight: '#528CFF',
            warning: '#FFB155',
            danger: '#FF8080',
            'text-primary': '#fff',
            'text-secondary': '#c7d2f3',
            'text-disabled': '#528CFF',
          },
          backgroundImage: {
            'gradient-lavender-coral-sunset':
              'linear-gradient(to right, #A281FF, #EB8280, #EBBF9A, #89D0FF)',
            'ape-portal-logo':
              'linear-gradient(180deg, #0036AD 0%, #00299A 100%)',
            'tab-button-selected':
              'linear-gradient(180deg, #2660D4 0%, #1558DE 100%)',
            'tab-button-unselected': 'linear-gradient(#0036AD, #0036AD)',
          },
          boxShadow: {
            'tab-header': '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
            'tab-button': '0px 1px 0px 0px #0045D4 inset',
            'tab-button-selected':
              'inset 0 1px 0 #5890FF, inset 0 -1px 0 #5890FF',
          },
          zIndex: {
            100: '100',
            60: '60',
          },
        },
      },
      themes: [
        {
          name: 'light',
          extend: {
            colors: {
              primary: 'hsl(0, 0%, 95%)',
              accent: 'hsl(0, 0%, 100%)',
              primaryDark: 'hsl(0, 0%, 80%)',
              primaryLight: 'hsl(0, 0%, 100%)',
              warning: '#D97A2B',
              danger: '#D94A4A',
              'text-primary': '#000',
              'text-secondary': '#000',
              'text-disabled': '#3A3A3A',
            },
            backgroundImage: {
              'ape-portal-logo':
                'linear-gradient(180deg, #FFFFFF 0%, #F2F2F2 100%)',
              'tab-button-selected':
                'linear-gradient(180deg, #F5F5F5 0%, #F2F2F2 100%)',
              'tab-button-unselected': 'linear-gradient(#F2F2F2, #F2F2F2)',
            },
            boxShadow: {
              'tab-header': '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
              'tab-button': '0px 1px 0px 0px #F2F2F2 inset',
              'tab-button-selected':
                'inset 0 1px 0 #E8E8E8, inset 0 -1px 0 #E8E8E8',
            },
          },
        },
        {
          name: 'dark',
          extend: {
            colors: {
              primary: '#262626',
              accent: '#1F1F1F',
              primaryDark: '#0F0F0F',
              primaryLight: '#3A3A3A',
              danger: '#D94A4A',
              'text-primary': '#fff',
              'text-secondary': '#fff',
              'text-disabled': '#9E9E9E',
            },
            backgroundImage: {
              'ape-portal-logo':
                'linear-gradient(180deg, #1F1F1F 0%, #0F0F0F 100%)',
              'tab-button-selected':
                'linear-gradient(180deg, #333333 0%, #1F1F1F 100%)',
              'tab-button-unselected': 'linear-gradient(#1C1C1C, #1C1C1C)',
            },
            boxShadow: {
              'tab-header': '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
              'tab-button': '0px 1px 0px 0px #1F1F1F inset',
              'tab-button-selected':
                'inset 0 1px 0 #4D4D4D, inset 0 -1px 0 #4D4D4D',
            },
          },
        },
      ],
    }),
    // eslint-disable-next-line unicorn/prefer-module
    require('tailwindcss-animate'),
    // eslint-disable-next-line unicorn/prefer-module
    require('tailwind-scrollbar'),
  ],
};
