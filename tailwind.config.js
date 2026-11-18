/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#080808',
          light: '#f7f7f8',
        },
        card: {
          dark: '#121214',
          light: '#ffffff',
          'dark-subtle': '#1a1a1d',
          'light-subtle': '#eeeeef',
        },
        fg: {
          dark: '#ffffff',
          light: '#0a0a0a',
          'dark-muted': '#a1a1aa',
          'light-muted': '#65656d',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          hover: 'var(--accent-hover)',
          fg: 'rgb(var(--accent-fg-rgb) / <alpha-value>)',
          subtle: 'rgb(var(--accent-rgb) / 0.1)',
        },
        border: {
          dark: '#27272a',
          light: '#e2e2e5',
        }
      },
      fontFamily: {
        heading: ['Prompt', 'sans-serif'],
        body: ['Sarabun', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
