
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: ['hover', 'focus', 'active'],
      textColor: ['hover', 'focus'],
      screens: {
        xs: "480px", // Extra small screens
        '2xl': '1440px', // Adjusting the 2xl breakpoint for larger screens
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        'slide-down': 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      'light', // DaisyUI built-in theme
      'dark',  // DaisyUI built-in theme
      {
        mytheme: {
          "color-scheme": "light",
          "primary": "#1D4ED8",
          "secondary": "#9333EA",
          "accent": "#F59E0B",
          "neutral": "#F3F4F6",
          "neutral-content": "#1F2937",
          "base-100": "#FFFFFF",
          "base-content": "#1F2937",
          "info": "#3B82F6",
          "info-content": "#FFFFFF",
          "success": "#10B981",
          "success-content": "#FFFFFF",
          "warning": "#FBBF24",
          "warning-content": "#1F2937",
          "error": "#EF4444",
          "error-content": "#FFFFFF",
        },
      },
    ],
  },
};
