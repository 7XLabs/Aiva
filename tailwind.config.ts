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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        floaty: "floaty 7s ease-in-out infinite",
        orb: "orb 22s ease-in-out infinite alternate",
        marquee: "marquee 28s linear infinite",
        shine: "shine 2.6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        orb: {
          from: { transform: "translate(0, 0) scale(1)" },
          to: { transform: "translate(60px, -40px) scale(1.15)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shine: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
