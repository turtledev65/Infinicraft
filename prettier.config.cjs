// prettier.config.js, .prettierrc.js, prettier.config.cjs, or .prettierrc.cjs

/** @type {import("prettier").Config} */
const config = {
  arrowParens: "avoid",
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
};

module.exports = config;
