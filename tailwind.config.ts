import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        border: "var(--border)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "heatmap-empty": "var(--heatmap-empty)",
        "heatmap-1": "var(--heatmap-1)",
        "heatmap-2": "var(--heatmap-2)",
        "heatmap-3": "var(--heatmap-3)",
        "heatmap-4": "var(--heatmap-4)",
      },
    },
  },
  plugins: [],
};
export default config;
