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
          base: "#f8f9fa",
          surface: "#ffffff",
          elevated: "#ffffff",
          stroke: "rgba(17,24,39,0.1)",
          muted: "#6B7280",
          ink: "#111827",
          green: "#10B981",
          greenDim: "rgba(16,185,129,0.12)",
          glow: "rgba(79,110,247,0.15)",
        },
        /* Semantic tokens used across existing components */
        brand: {
          dark: "#111827",
          mid: "#6B7280",
          teal: "#4F6EF7",
          tealLt: "rgba(79,110,247,0.1)",
          bg: "#f0f2f8",
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
        card: "0 1px 8px rgba(17,24,39,0.08), 0 0 0 1px rgba(17,24,39,0.05)",
        modal: "0 8px 40px rgba(17,24,39,0.18)",
        glow: "0 0 0 3px rgba(79,110,247,0.15)",
      },
      backgroundImage: {
        "rd-gradient": "linear-gradient(155deg, #f0f2f8 0%, #f8f9fa 50%, #eef1fb 100%)",
        "rd-mesh": "none",
      },
    },
  },
  plugins: [],
};
