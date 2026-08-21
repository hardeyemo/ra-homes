import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        // Semantic tokens backed by CSS variables (see globals.css) so the
        // same class names repaint correctly in light and dark mode.
        ink: "hsl(var(--ink))", // charcoal/black — primary text & surfaces
        parchment: "hsl(var(--parchment))", // cream/white — page background
        surface: "hsl(var(--surface))", // card backgrounds
        sage: {
          DEFAULT: "hsl(var(--sage))",
          light: "hsl(var(--sage-light))",
          dark: "hsl(var(--sage-dark))",
        },
        clay: {
          // champagne/gold accent — kept the "clay" token name so existing
          // components repaint automatically without a mass rename.
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
        },
        gold: "hsl(var(--gold))",
        line: "hsl(var(--line))", // hairline rule color
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        lg: "8px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
