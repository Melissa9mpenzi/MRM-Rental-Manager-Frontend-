/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      opacity: {
        6: "0.06",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        28: "0.28",
      },
      colors: {
        rd: {
          base: "var(--rd-base)",
          surface: "var(--rd-surface)",
          elevated: "var(--rd-elevated)",
          stroke: "var(--rd-stroke)",
          muted: "var(--rd-muted)",
          ink: "var(--rd-ink)",
          green: "#00C076",
          greenDim: "rgba(0,192,118,0.14)",
          glow: "rgba(0,192,118,0.35)",
        },
        brand: {
          dark: "var(--brand-dark)",
          mid: "var(--brand-mid)",
          teal: "var(--brand-teal)",
          tealLt: "var(--brand-teal-lt)",
          bg: "var(--brand-bg)",
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
        "rd-gradient": "var(--rd-gradient)",
        "rd-mesh": "var(--rd-mesh)",
      },
    },
  },
  plugins: [],
};
