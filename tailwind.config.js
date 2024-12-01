/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      light: {
        bodyBg: "#FAE7E9",
        mainBg: "#FFFFFF80",
        title: "#808080",
        text: "#999999",
        border: "#E5E5E5",
        inputBg: "#F2F2F2",
        inputText: "#333333",
      },
      dark: {
        bodyBg: "#110a08",
        mainBg: "#00000080",
        primary: "#CE1127",
        title: "#808080",
        text: "#7c7a79",
        border: "#141313",
        inputBg: "#0d0d0d",
        green: "#13b76a",
      },
      primary: "#CE1127",
      secondary: "#F0B8BE",
      green: "#12B76A",
      transparent: "transparent",
      current: "currentColor",
      red: colors.red,
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
    },
    fontFamily: {
      poppins: ["Poppins"],
      cairo: ["Cairo"],
    },
  },
  plugins: [],
};
