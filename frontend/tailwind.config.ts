import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        surface: "#111827",
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#8B5CF6",
        },
        accent: "#06B6D4",
        text: {
          DEFAULT: "#E5E7EB",
          muted: "#94A3B8",
        },
        neural: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        glow: {
          primary: "rgba(124, 58, 237, 0.4)",
          accent: "rgba(6, 182, 212, 0.4)",
          rose: "rgba(244, 63, 94, 0.4)",
        },
      },
      backgroundImage: {
        "neural-gradient": "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1) 0%, rgba(9, 9, 11, 0) 50%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "neural-scan": "neural-scan 3s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "neural-scan": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "0.5" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

