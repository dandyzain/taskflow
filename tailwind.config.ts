import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const hsl = (v: string) => `hsl(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      xs: "400px",
      ...defaultTheme.screens,
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px — micro badges only
      },
      colors: {
        border: {
          DEFAULT: hsl("--border"),
          strong: hsl("--border-strong"),
        },
        input: hsl("--input"),
        ring: hsl("--ring"),
        background: hsl("--background"),
        foreground: hsl("--foreground"),
        surface: {
          sunken: hsl("--surface-sunken"),
        },
        primary: {
          DEFAULT: hsl("--primary"),
          foreground: hsl("--primary-foreground"),
        },
        brand: {
          from: hsl("--brand-from"),
          via: hsl("--brand-via"),
          to: hsl("--brand-to"),
        },
        secondary: {
          DEFAULT: hsl("--secondary"),
          foreground: hsl("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: hsl("--destructive"),
          foreground: hsl("--destructive-foreground"),
        },
        success: { DEFAULT: hsl("--success"), soft: hsl("--success-soft") },
        warning: { DEFAULT: hsl("--warning"), soft: hsl("--warning-soft") },
        danger: { DEFAULT: hsl("--danger"), soft: hsl("--danger-soft") },
        info: { DEFAULT: hsl("--info"), soft: hsl("--info-soft") },
        muted: {
          DEFAULT: hsl("--muted"),
          foreground: hsl("--muted-foreground"),
        },
        accent: {
          DEFAULT: hsl("--accent"),
          foreground: hsl("--accent-foreground"),
        },
        popover: {
          DEFAULT: hsl("--popover"),
          foreground: hsl("--popover-foreground"),
        },
        card: {
          DEFAULT: hsl("--card"),
          foreground: hsl("--card-foreground"),
        },
        pastel: {
          mint: { DEFAULT: hsl("--pastel-mint"), text: hsl("--pastel-mint-text") },
          sky: { DEFAULT: hsl("--pastel-sky"), text: hsl("--pastel-sky-text") },
          peach: { DEFAULT: hsl("--pastel-peach"), text: hsl("--pastel-peach-text") },
          lavender: { DEFAULT: hsl("--pastel-lavender"), text: hsl("--pastel-lavender-text") },
          rose: { DEFAULT: hsl("--pastel-rose"), text: hsl("--pastel-rose-text") },
          butter: { DEFAULT: hsl("--pastel-butter"), text: hsl("--pastel-butter-text") },
        },
      },
      opacity: {
        "12": "0.12",
        "8": "0.08",
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "18": "4.5rem",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "2xs": "0 1px 0 0 hsl(var(--shadow-color) / 0.04)",
        xs: "0 1px 2px 0 hsl(var(--shadow-color) / 0.06)",
        // Elevation scale
        e1: "0 1px 2px hsl(var(--shadow-color) / 0.06), 0 1px 1px hsl(var(--shadow-color) / 0.04)",
        e2: "0 4px 12px -2px hsl(var(--shadow-color) / 0.1), 0 2px 4px -2px hsl(var(--shadow-color) / 0.06)",
        e3: "0 20px 40px -12px hsl(var(--shadow-color) / 0.25), 0 8px 16px -8px hsl(var(--shadow-color) / 0.12)",
        glow: "0 0 0 1px hsl(var(--primary) / 0.25), 0 8px 30px -6px hsl(var(--primary) / 0.35)",
        // Legacy aliases (kept so older markup keeps rendering sensibly)
        pastel: "0 20px 40px -12px hsl(var(--shadow-color) / 0.2), 0 8px 16px -8px hsl(var(--shadow-color) / 0.1)",
        card: "0 1px 2px hsl(var(--shadow-color) / 0.06), 0 1px 1px hsl(var(--shadow-color) / 0.04)",
        "card-hover": "0 8px 20px -6px hsl(var(--shadow-color) / 0.14), 0 3px 6px -3px hsl(var(--shadow-color) / 0.08)",
        float: "0 24px 48px -12px hsl(var(--shadow-color) / 0.3), 0 0 0 1px hsl(var(--primary) / 0.2)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        instant: "100ms",
        quick: "160ms",
        base: "240ms",
        slow: "400ms",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.25s ease-out both",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 2.2s linear infinite",
        shake: "shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/container-queries")],
};

export default config;
