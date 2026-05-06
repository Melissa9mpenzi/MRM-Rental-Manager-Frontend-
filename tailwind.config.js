/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:   "#161d23",   // Deep Charcoal — sidebars, navbars, dark cards
          mid:    "#5a7a72",   // Sage Slate — body text, secondary labels
          teal:   "#3aad85",   // MRM Green — CTAs, active states, links (brighter)
          tealLt: "#d0f0e6",   // Light MRM Green — hover backgrounds, panel tints
          bg:     "#f3f8f6",   // Page background (subtle green tint)
        },
      },
      fontFamily: {
        sans: ["Quicksand", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(22, 29, 35, 0.08)",
        modal: "0 8px 32px rgba(22, 29, 35, 0.18)",
      },
    },
  },
  plugins: [],
};