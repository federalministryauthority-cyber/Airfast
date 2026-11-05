/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#071B35',
          50: '#E8EDF4',
          100: '#C9D4E3',
          800: '#0B2544',
          900: '#071B35',
        },
        royal: {
          DEFAULT: '#0757A6',
          600: '#0757A6',
          500: '#1675CE',
          300: '#7FB3E6',
        },
        gold: {
          DEFAULT: '#C5A04A',
          light: '#E1C477',
          600: '#A8842F',
        },
        charcoal: {
          DEFAULT: '#30343B',
          dark: '#252B33',
          card: '#3B424B',
        },
        mist: '#C1C9D2',
        success: { DEFAULT: '#1E8E5A', light: '#D1F2E1' },
        warning: { DEFAULT: '#B7791F', light: '#FCEFD1' },
        danger: { DEFAULT: '#C2412D', light: '#FBE1DC' },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 20px 50px -20px rgba(7, 27, 53, 0.55)',
        gold: '0 10px 30px -12px rgba(197, 160, 74, 0.55)',
      },
      backgroundImage: {
        'royal-gradient': 'linear-gradient(135deg, #0757A6 0%, #1675CE 100%)',
        'navy-gradient': 'linear-gradient(180deg, #071B35 0%, #252B33 100%)',
      },
    },
  },
  plugins: [],
};
