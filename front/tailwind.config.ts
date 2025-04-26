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
        brand: "var(--color-brand)",
        "brand-subtle": "var(--color-brand-subtle)",
        outline: "var(--color-outline)",
        ash: "var(--color-ash)",
        "ash-strong": "var(--color-ash-strong)",
        canvas: "var(--color-canvas)",
      },
    },
  },
  plugins: [],
} satisfies Config;
