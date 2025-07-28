import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        aeonik: ["Aeonik-"],
        "radio-grotesk": ["Radio Grotesk"],
      },
      colors: {
        brand: "rgb(var(--color-brand) / <alpha-value>)",
        "brand-subtle": "rgb(var(--color-brand-subtle) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",
        ash: "rgb(var(--color-ash) / <alpha-value>)",
        "ash-strong": "rgb(var(--color-ash-strong) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
