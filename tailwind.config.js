const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Nunito Sans"', ...defaultTheme.fontFamily.sans],
      },
      height: {
        titlebar: "2rem",
        "below-titlebar": "calc(100vh - 2rem)",
      },
      minHeight: {
        "below-titlebar-min": "calc(100vh - 2rem)",
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};
