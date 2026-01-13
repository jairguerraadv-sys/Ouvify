import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Paleta Ouvy - Baseada na Logo
        // Ciano/Turquesa (Ondas da Logo) - Cor Principal
        primary: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4", // Cor exata da logo
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
          950: "#083344",
        },
        // Azul Escuro/Marinho (Texto da Logo) - Cor Secundária
        secondary: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A", // Cor exata do texto da logo
          950: "#020617",
        },
        // Neutros elegantes
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
        },
        // Accent: Tom mais claro do ciano para destaques
        accent: {
          light: "#22D3EE",
          DEFAULT: "#06B6D4",
          dark: "#0891B2",
        },
        // Backgrounds
        background: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8FAFC",
          tertiary: "#F1F5F9",
          dark: "#0F172A",
        },
        // Textos
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          tertiary: "#64748B",
          inverse: "#FFFFFF",
        },
        // Estados semânticos
        success: {
          light: "#D1FAE5",
          DEFAULT: "#10B981",
          dark: "#047857",
        },
        warning: {
          light: "#FEF3C7",
          DEFAULT: "#F59E0B",
          dark: "#D97706",
        },
        error: {
          light: "#FEE2E2",
          DEFAULT: "#EF4444",
          dark: "#DC2626",
        },
        info: {
          light: "#DBEAFE",
          DEFAULT: "#3B82F6",
          dark: "#1D4ED8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#0A1E3B",
            a: {
              color: "#00BCD4",
              fontWeight: "600",
              "&:hover": {
                color: "#0097A7",
              },
            },
            h1: { color: "#0A1E3B", fontWeight: "800", fontSize: "2.25rem" },
            h2: { color: "#0A1E3B", fontWeight: "700", fontSize: "1.875rem" },
            h3: { color: "#0A1E3B", fontWeight: "600", fontSize: "1.5rem" },
            h4: { color: "#0A1E3B", fontWeight: "600", fontSize: "1.25rem" },
            strong: { color: "#0A1E3B", fontWeight: "700" },
            code: {
              color: "#0097A7",
              backgroundColor: "#F1F5F9",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
              fontWeight: "500",
            },
          },
        },
      },
      boxShadow: {
        xs: "0 1px 1px 0 rgba(10, 30, 59, 0.05)",
        sm: "0 1px 2px 0 rgba(10, 30, 59, 0.05), 0 1px 1px -1px rgba(10, 30, 59, 0.04)",
        DEFAULT: "0 1px 3px 0 rgba(10, 30, 59, 0.1), 0 1px 2px -1px rgba(10, 30, 59, 0.06)",
        subtle: "0 2px 8px rgba(10, 30, 59, 0.08)",
        md: "0 4px 6px -1px rgba(10, 30, 59, 0.1), 0 2px 4px -2px rgba(10, 30, 59, 0.06)",
        lg: "0 10px 15px -3px rgba(10, 30, 59, 0.1), 0 4px 6px -4px rgba(10, 30, 59, 0.05)",
        xl: "0 20px 25px -5px rgba(10, 30, 59, 0.1), 0 8px 10px -6px rgba(10, 30, 59, 0.04)",
        "2xl": "0 25px 50px -12px rgba(10, 30, 59, 0.15)",
        "3xl": "0 35px 60px -15px rgba(10, 30, 59, 0.2)",
        neon: "0 0 20px rgba(0, 188, 212, 0.3)",
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "3rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "slide-down": {
          "0%": {
            transform: "translateY(-20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "slide-left": {
          "0%": {
            transform: "translateX(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "slide-right": {
          "0%": {
            transform: "translateX(-20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-gentle": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-5px)",
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-1000px 0",
          },
          "100%": {
            backgroundPosition: "1000px 0",
          },
        },
        blur: {
          "0%, 100%": {
            filter: "blur(0px)",
          },
          "50%": {
            filter: "blur(10px)",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-in-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.4s ease-out",
        "slide-left": "slide-left 0.4s ease-out",
        "slide-right": "slide-right 0.4s ease-out",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scale-in": "scale-in 0.3s ease-out",
        "spin-slow": "spin-slow 3s linear infinite",
        "bounce-gentle": "bounce-gentle 2s infinite",
        shimmer: "shimmer 2s infinite",
        blur: "blur 3s ease-in-out infinite",
      },
      transitionDuration: {
        0: "0ms",
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      },
    },
  },
  plugins: [],
};
export default config;
