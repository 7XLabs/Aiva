import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dde7ff",
          200: "#c2d3ff",
          300: "#9cb5ff",
          400: "#748cff",
          500: "#5464fb",
          600: "#3d3ff0",
          700: "#3230d4",
          800: "#2b2aab",
          900: "#292b87",
          950: "#191a4e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
