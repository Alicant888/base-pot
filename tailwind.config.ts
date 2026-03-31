import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        base: "#0052ff",
        mist: "#eef4ff",
        line: "#d9e2f5",
        muted: "#5d6472",
      },
      boxShadow: {
        panel: "0 16px 40px rgba(5, 5, 5, 0.06)",
      },
      fontFamily: {
        sans: ["Aptos", "Segoe UI", "Helvetica Neue", "sans-serif"],
        mono: ["Consolas", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(to right, rgba(0,82,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,82,255,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        "hero-grid": "32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
