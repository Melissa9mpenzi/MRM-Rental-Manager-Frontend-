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
        brand: {
          dark: "#111827",
          mid: "#6B7280",
          teal: "#0D9488",
          tealMid: "#14B8A6",
          tealLt: "rgba(20,184,166,0.10)",
          tealBorder: "rgba(20,184,166,0.25)",
          bg: "#F8FAFB",
          surface: "#FFFFFF",
          border: "#E5E7EB",
        },
        rd: {
          base: "#F8FAFB",
          surface: "#FFFFFF",
          elevated: "#FFFFFF",
          stroke: "rgba(0,0,0,0.07)",
          muted: "#6B7280",
          ink: "#111827",
          green: "#0D9488",
          greenDim: "rgba(13,148,136,0.10)",
          glow: "rgba(13,148,136,0.20)",
          sidebar: "#FFFFFF",
          sidebarHover: "#F0FDFA",
          sidebarActive: "#CCFBF1",
          sidebarText: "#374151",
          sidebarBorder: "#E5E7EB",
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
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
        modal: "0 20px 60px rgba(0,0,0,0.12)",
        glow: "0 0 32px rgba(13,148,136,0.15)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.08)",
        sidebar: "2px 0 8px rgba(0,0,0,0.05)",
      },
      backgroundImage: {
        "rd-gradient": "linear-gradient(160deg, #F8FAFB 0%, #F0FDFA 40%, #F8FAFB 100%)",
        "rd-mesh": "none",
        "hero-gradient": "linear-gradient(155deg, #0D9488 0%, #0F766E 50%, #134E4A 100%)",
      },
    },
  },
  plugins: [],
};
