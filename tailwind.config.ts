import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dusk: {
          50: "#FDF6E8",
          100: "#F7EAD1",
          200: "#EAD2A5",
          300: "#D9B477",
          400: "#C79A54",
          500: "#A37B3E",
          600: "#7C5F2F",
          700: "#574321",
          800: "#312416",
          900: "#181008",
        },
        ember: "#E4B167",
        coal: "#0A0603",
      },
      fontFamily: {
        serifDisplay: ["var(--font-amarante)", ...defaultTheme.fontFamily.serif],
        sansBody: ["var(--font-amarante)", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        aurora: "0 20px 60px rgba(12,7,2,0.85)",
        "glow-gold": "0 0 24px rgba(228,177,103,0.35)",
      },
      backgroundImage: {
        "noise-texture": "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'120\' height=\'120\' filter=\'url(%23n)\' opacity=\'0.15\'/%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [],
};

export default config;
