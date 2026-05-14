/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      /* Mockup uses fractional borders (e.g. 12%); default Tailwind opacity skips these keys. */
      opacity: {
        6: "0.06",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        28: "0.28",
      },
      colors: {
        rd: {
          base: "#060a0e",
          surface: "rgba(255,255,255,0.05)",
          elevated: "rgba(18,26,34,0.88)",
          stroke: "rgba(255,255,255,0.1)",
          muted: "#8b9db0",
          ink: "#f4f4f5",
          green: "#00C076",
          greenDim: "rgba(0,192,118,0.14)",
          glow: "rgba(0,192,118,0.35)",
        },
        /* Semantic tokens used across existing components */
        brand: {
          dark: "#f1f5f9",
          mid: "#8b9db0",
          teal: "#00C076",
          tealLt: "rgba(0,192,118,0.16)",
          bg: "#080d12",
        },
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "22px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.35)",
        modal: "0 24px 48px rgba(0,0,0,0.55)",
        glow: "0 0 40px rgba(0,192,118,0.12)",
      },
      backgroundImage: {
        "rd-gradient":
          "linear-gradient(155deg, #0a1018 0%, #060a0e 42%, #0d1520 100%)",
        "rd-mesh":
          "radial-gradient(ellipse 80% 50% at 15% -5%, rgba(0,192,118,0.14), transparent 52%), radial-gradient(ellipse 55% 45% at 100% 0%, rgba(59,130,246,0.07), transparent 48%)",
      },
    },
  },
  plugins: [],
};
