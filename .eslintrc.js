module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["prettier", "standard-with-typescript"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {},
}
