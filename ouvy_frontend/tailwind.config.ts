import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Paleta de cores extraída da logo Ouvy
        // Cyan vibrante (ícone/acento)
        primary: {
          light: "#00E5FF",  // Cyan mais claro
          DEFAULT: "#00BCD4", // Cyan vibrante (cor principal)
          dark: "#0097A7",   // Cyan mais escuro
        },
        // Azul marinho profundo (texto/navegação)
        secondary: {
          light: "#1A3A52",  // Azul marinho claro
          DEFAULT: "#0A1E3B", // Azul marinho profundo (cor de base)
          dark: "#051121",   // Azul marinho muito escuro
        },
        // Neutros e backgrounds
        neutral: {
          50: "#F8FAFC",    // Cinza muito claro (backgrounds secundários)
          100: "#F1F5F9",   // Cinza claro
          200: "#E2E8F0",   // Cinza suave
          300: "#CBD5E1",   // Cinza médio
          500: "#64748B",   // Cinza neutro
          700: "#334155",   // Cinza escuro
          900: "#0F172A",   // Cinza muito escuro
        },
        // Accent: Variação do ciano para destaques
        accent: {
          DEFAULT: "#00D4FF", // Ciano mais brilhante para gradientes/hovers
        },
        // Backgrounds limpos
        background: {
          DEFAULT: "#FFFFFF", // Branco limpo
          secondary: "#F8FAFC", // Cinza muito claro para seções secundárias
        },
        // Textos com alto contraste
        text: {
          primary: "#0A1E3B", // Azul marinho para títulos (igual secondary)
          secondary: "#475569", // Cinza neutro para parágrafos
        },
        // Estados semânticos
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // Tipografia moderna Inter para combinar com a logo
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#0A1E3B",
            a: {
              color: "#00BCD4",
              "&:hover": {
                color: "#0097A7",
              },
            },
            h1: { color: "#0A1E3B", fontWeight: "700" },
            h2: { color: "#0A1E3B", fontWeight: "700" },
            h3: { color: "#0A1E3B", fontWeight: "600" },
            strong: { color: "#0A1E3B" },
          },
        },
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(10, 30, 59, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(10, 30, 59, 0.1), 0 1px 2px 0 rgba(10, 30, 59, 0.06)",
        md: "0 4px 6px -1px rgba(10, 30, 59, 0.1), 0 2px 4px -1px rgba(10, 30, 59, 0.06)",
        lg: "0 10px 15px -3px rgba(10, 30, 59, 0.1), 0 4px 6px -2px rgba(10, 30, 59, 0.05)",
        xl: "0 20px 25px -5px rgba(10, 30, 59, 0.1), 0 10px 10px -5px rgba(10, 30, 59, 0.04)",
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
