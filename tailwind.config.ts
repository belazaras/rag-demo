import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 🎨 Custom brand colors
      colors: {
        accent: {
          purple: "#8B5CF6", // violet-500
          blue: "#3B82F6", // blue-500
        },
      },

      // 🪶 Inter variable font (loaded via next/font in layout.tsx)
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },

      // 🌈 Gradients & shadows
      backgroundImage: {
        "gradient-accent": "linear-gradient(to right, #8B5CF6, #3B82F6)",
      },

      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)",
      },

      // 🧱 Optional radius rhythm
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
