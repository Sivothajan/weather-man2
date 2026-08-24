import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-ibm-plex-mono)'],
        display: ['var(--font-baloo-thambi-2)'],
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
