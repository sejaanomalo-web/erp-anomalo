import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "background-alt": "var(--background-alt)",
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          active: "var(--accent-active)",
          subtle: "var(--accent-subtle)",
          strong: "var(--accent-strong)",
        },
        text: {
          1: "var(--text-1)",
          2: "var(--text-2)",
          3: "var(--text-3)",
          4: "var(--text-4)",
        },
        border: {
          thin: "var(--border-thin)",
          medium: "var(--border-medium)",
          accent: "var(--border-accent)",
        },
        success: "#16a34a",
        warning: "#eab308",
        error: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        display: [
          "2.25rem",
          { lineHeight: "1.05", letterSpacing: "0.01em", fontWeight: "700" },
        ],
        h1: [
          "2rem",
          { lineHeight: "1.1", letterSpacing: "0.04em", fontWeight: "700" },
        ],
        h2: [
          "1.5rem",
          { lineHeight: "1.15", letterSpacing: "0.03em", fontWeight: "700" },
        ],
        h3: [
          "1.25rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h4: [
          "1rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h5: [
          "0.875rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h6: [
          "0.8125rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-md": ["0.9375rem", { lineHeight: "1.55", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        button: [
          "0.6875rem",
          { lineHeight: "1", letterSpacing: "0.08em", fontWeight: "700" },
        ],
        "label-caps": [
          "0.75rem",
          { lineHeight: "1.25", letterSpacing: "0.08em", fontWeight: "600" },
        ],
        caption: [
          "0.75rem",
          { lineHeight: "1.1", letterSpacing: "0.06em", fontWeight: "400" },
        ],
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "80px",
      },
      borderRadius: {
        none: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        DEFAULT: "0",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        "hover-sm": "0 0 0 1px rgba(229,184,42,0.22)",
        "hover-md":
          "0 0 0 1px rgba(229,184,42,0.42), 0 0 28px rgba(229,184,42,0.12)",
        elevated: "0 8px 24px rgba(0,0,0,0.6)",
        "elevated-warm": "0 12px 32px rgba(229,184,42,0.08), 0 4px 12px rgba(0,0,0,0.6)",
      },
      transitionDuration: {
        fast: "150ms",
        medium: "200ms",
        slow: "280ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 200ms ease",
        "accordion-up": "accordion-up 200ms ease",
        "fade-in": "fade-in 150ms ease",
        "slide-in-right": "slide-in-right 220ms ease",
        "slide-in-bottom": "slide-in-bottom 280ms ease",
      },
      zIndex: {
        rail: "30",
        backdrop: "40",
        "rail-mobile": "50",
        topbar: "60",
        drawer: "200",
        modal: "300",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
