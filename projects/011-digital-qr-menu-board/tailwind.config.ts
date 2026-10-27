import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Outfit", "Poppins", "-apple-system", "sans-serif"],
      },
      colors: {
        zred: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FFA3A3',
          400: '#FF6B6B',
          500: '#E23744',
          600: '#CB202D',
          700: '#B91C28',
          800: '#9A1723',
          900: '#7D131D',
          950: '#4A0B11',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 6px -1px rgba(0, 0, 0, 0.06), 0 1px 4px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06)',
        'drawer': '0 -8px 30px -4px rgba(0, 0, 0, 0.15)',
        'zomato': '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
