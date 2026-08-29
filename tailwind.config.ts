import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "bg-base": "var(--bg-base)",
                "bg-card": "var(--bg-card)",
                "accent-blue": "var(--accent-blue)",
                "accent-violet": "var(--accent-violet)",
                "text-primary": "var(--text-primary)",
                "text-muted": "var(--text-muted)",
                "border-subtle": "var(--border-subtle)",
            },
            fontFamily: {
                "space-grotesk": ["var(--font-space-grotesk)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
