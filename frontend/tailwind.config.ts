import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Water & Public Health Core Palette
        navy: {
          DEFAULT: "#123B5D",
          dark: "#0C273E",
          light: "#1A4D78",
        },
        teal: {
          DEFAULT: "#0F766E",
          dark: "#0D655E",
          light: "#14958B",
        },
        aqua: {
          DEFAULT: "#DDF4F1",
          light: "#EEFAF8",
          dark: "#C3EBE6",
        },
        canvas: "#F6FAFC",
        surface: "#FFFFFF",
        main: "#273746",
        muted: "#526777",
        borderline: "#D9E5EB",

        // Semantic status tokens
        success: "#166534",
        warning: "#A16207",
        danger: "#B42318",

        // Compatibility mappings
        ink: "#123B5D",
        slate: "#526777",
        mist: "#F6FAFC",
        white: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(18, 59, 93, 0.05), 0 1px 2px -1px rgba(18, 59, 93, 0.05)",
        card: "0 4px 6px -1px rgba(18, 59, 93, 0.07), 0 2px 4px -2px rgba(18, 59, 93, 0.05)",
        float: "0 10px 15px -3px rgba(18, 59, 93, 0.08), 0 4px 6px -4px rgba(18, 59, 93, 0.04)",
      },
      borderRadius: {
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
