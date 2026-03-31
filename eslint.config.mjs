import tsParser from "@typescript-eslint/parser";

const config = [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      ".next/**",
      "node_modules/**",
      ".tools/**",
      "cache/**",
      "broadcast/**",
      "out/**",
      "contracts/out/**",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {},
  },
];

export default config;
