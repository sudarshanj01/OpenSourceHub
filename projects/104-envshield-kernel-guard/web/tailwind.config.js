/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#09090b',
          900: '#18181b',
          850: '#202024',
          800: '#27272a',
        },
        emerald: {
          500: '#10b981',
          400: '#34d399',
        },
      },
    },
  },
  plugins: [],
};
