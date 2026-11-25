/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orac: {
          bg: '#14110f',
          deep: '#1a1613',
          card: '#201b17',
          cardHover: '#28221d',
          border: 'rgba(239, 152, 70, 0.18)',
          borderHover: 'rgba(239, 152, 70, 0.45)',
          copper: '#ef9846',
          copperLight: '#f8cba2',
          copperDark: '#d97e28',
          sand: '#cfb8a2',
          sandDark: '#8c7866',
          ivory: '#fbfbf9',
        },
      },
      fontFamily: {
        display: ['Funnel Display', 'Geist', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['GeistMono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'copper-glow': '0 0 35px -5px rgba(239, 152, 70, 0.35)',
        'copper-sm': '0 0 15px -3px rgba(239, 152, 70, 0.25)',
      },
    },
  },
  plugins: [],
};
