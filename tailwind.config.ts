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
        // Semântica de status (Anômalo dark-gold)
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        danger: "var(--danger)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: [
          "var(--font-roboto-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        // Anômalo: hierarquia por tamanho/peso, títulos bold sentence case
        // com tracking apertado; uppercase só nas utilitárias (label/caption).
        display: [
          "2rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        h1: [
          "2rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        h2: [
          "1.5rem",
          { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        h3: [
          "1.25rem",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h4: [
          "1rem",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h5: [
          "0.875rem",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h6: [
          "0.8125rem",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-md": [
          "0.875rem",
          { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" },
        ],
        "body-sm": [
          "0.75rem",
          { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" },
        ],
        button: [
          "0.6875rem",
          { lineHeight: "1", letterSpacing: "0.075em", fontWeight: "700" },
        ],
        "label-caps": [
          "0.75rem",
          { lineHeight: "1.25", letterSpacing: "0.075em", fontWeight: "600" },
        ],
        caption: [
          "0.75rem",
          { lineHeight: "1", letterSpacing: "0.06em", fontWeight: "400" },
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
        // Glow dourado discreto + drop escuro para drawers/modais
        sm: "0 0 0 1px rgba(201,149,58,0.20)",
        md: "0 0 0 1px rgba(201,149,58,0.40), 0 0 24px rgba(201,149,58,0.10)",
        lg: "0 8px 24px rgba(0,0,0,0.6)",
        elevated: "0 8px 24px rgba(0,0,0,0.6)",
        "hover-sm": "0 0 0 1px rgba(201,149,58,0.20)",
        "hover-md":
          "0 0 0 1px rgba(201,149,58,0.40), 0 0 24px rgba(201,149,58,0.10)",
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
