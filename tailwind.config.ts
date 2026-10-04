import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Pastel palette
        pastel: {
          mint: {
            DEFAULT: "hsl(var(--pastel-mint))",
            text: "hsl(var(--pastel-mint-text))",
          },
          sky: {
            DEFAULT: "hsl(var(--pastel-sky))",
            text: "hsl(var(--pastel-sky-text))",
          },
          peach: {
            DEFAULT: "hsl(var(--pastel-peach))",
            text: "hsl(var(--pastel-peach-text))",
          },
          lavender: {
            DEFAULT: "hsl(var(--pastel-lavender))",
            text: "hsl(var(--pastel-lavender-text))",
          },
          rose: {
            DEFAULT: "hsl(var(--pastel-rose))",
            text: "hsl(var(--pastel-rose-text))",
          },
          butter: {
            DEFAULT: "hsl(var(--pastel-butter))",
            text: "hsl(var(--pastel-butter-text))",
          },
        },
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        pastel: "0 10px 25px -5px rgba(139, 104, 246, 0.1), 0 8px 10px -6px rgba(139, 104, 246, 0.05)",
        card: "0 2px 10px -2px rgba(26, 28, 46, 0.05), 0 1px 3px -1px rgba(26, 28, 46, 0.03)",
        "card-hover": "0 14px 28px -6px rgba(139, 104, 246, 0.15), 0 6px 12px -4px rgba(26, 28, 46, 0.06)",
        float: "0 20px 35px -10px rgba(139, 104, 246, 0.2)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(0.98)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 4s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
