/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / 1)",
        bg2: "rgb(var(--bg2) / 1)",
        fg: "rgb(var(--fg) / 1)",
        muted: "rgb(var(--muted) / 1)",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};
