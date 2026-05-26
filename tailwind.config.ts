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
        // Gmail Material 3: Google Blue 700 como ação primária
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          active: "var(--accent-active)",
          subtle: "var(--accent-subtle)",
          strong: "var(--accent-strong)",
        },
        // M3 secondary container — Compose pill, active nav, badges
        "compose": {
          DEFAULT: "var(--compose)",
          foreground: "var(--compose-foreground)",
        },
        // M3 primary container — selected row tint
        "selected": {
          DEFAULT: "var(--selected)",
          foreground: "var(--selected-foreground)",
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
        // Google brand palette
        success: "#34A853",
        warning: "#FBBC04",
        error: "#EA4335",
        info: "#4285F4",
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
        display: ["var(--font-roboto)", "system-ui", "sans-serif"],
        mono: [
          "var(--font-roboto-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        icons: [
          "Material Symbols Outlined",
          "Material Icons",
          "sans-serif",
        ],
      },
      fontSize: {
        // Gmail/M3: sentence case throughout, no uppercase forçado
        display: [
          "1.375rem",
          { lineHeight: "1.2", letterSpacing: "0em", fontWeight: "500" },
        ],
        h1: [
          "1.5rem",
          { lineHeight: "1.25", letterSpacing: "0em", fontWeight: "500" },
        ],
        h2: [
          "1.25rem",
          { lineHeight: "1.3", letterSpacing: "0em", fontWeight: "500" },
        ],
        h3: [
          "1.125rem",
          { lineHeight: "1.33", letterSpacing: "0em", fontWeight: "500" },
        ],
        h4: [
          "1rem",
          { lineHeight: "1.4", letterSpacing: "0em", fontWeight: "500" },
        ],
        h5: [
          "0.875rem",
          {
            lineHeight: "1.43",
            letterSpacing: "0.0142857em",
            fontWeight: "500",
          },
        ],
        h6: [
          "0.8125rem",
          { lineHeight: "1.5", letterSpacing: "0.01em", fontWeight: "500" },
        ],
        "body-md": [
          "0.875rem",
          {
            lineHeight: "1.43",
            letterSpacing: "0.0142857em",
            fontWeight: "400",
          },
        ],
        "body-sm": [
          "0.8125rem",
          {
            lineHeight: "1.46",
            letterSpacing: "0.0153846em",
            fontWeight: "400",
          },
        ],
        button: [
          "0.875rem",
          {
            lineHeight: "1.43",
            letterSpacing: "0.0142857em",
            fontWeight: "500",
          },
        ],
        "label-caps": [
          "0.75rem",
          {
            lineHeight: "1.33",
            letterSpacing: "0.025em",
            fontWeight: "500",
          },
        ],
        caption: [
          "0.75rem",
          {
            lineHeight: "1.33",
            letterSpacing: "0.0333333em",
            fontWeight: "400",
          },
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
        // Gmail: rounded amigável. Default 8px, pill para botões e search,
        // 4px para label tags pequenas.
        none: "0",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
        DEFAULT: "8px",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        // M3 elevations suavizadas para uso em produtividade
        sm: "0 1px 2px 0 rgba(60,64,67,0.10), 0 1px 3px 1px rgba(60,64,67,0.05)",
        md: "0 1px 3px 0 rgba(60,64,67,0.16), 0 4px 8px 3px rgba(60,64,67,0.08)",
        lg: "0 4px 8px 3px rgba(60,64,67,0.15), 0 1px 3px 0 rgba(60,64,67,0.20)",
        elevated:
          "0 4px 12px rgba(60,64,67,0.15), 0 1px 3px 0 rgba(60,64,67,0.10)",
        "hover-sm": "0 1px 2px 0 rgba(60,64,67,0.10)",
        "hover-md": "0 2px 6px 2px rgba(60,64,67,0.12)",
      },
      transitionDuration: {
        fast: "150ms",
        medium: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        decelerate: "cubic-bezier(0, 0, 0.2, 1)",
        accelerate: "cubic-bezier(0.4, 0, 1, 1)",
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
        "accordion-down":
          "accordion-down 250ms cubic-bezier(0.2, 0, 0, 1)",
        "accordion-up":
          "accordion-up 250ms cubic-bezier(0.2, 0, 0, 1)",
        "fade-in": "fade-in 150ms cubic-bezier(0.2, 0, 0, 1)",
        "slide-in-right":
          "slide-in-right 250ms cubic-bezier(0.2, 0, 0, 1)",
        "slide-in-bottom":
          "slide-in-bottom 300ms cubic-bezier(0.05, 0.7, 0.1, 1)",
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
