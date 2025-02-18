import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Get current directory using ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create an ESLint configuration using FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    parser: '@babel/eslint-parser',
    parserOptions: {
      requireConfigFile: false,
      babelOptions: {
        presets: ['next/babel'],
      },
    },
  },
];

export default eslintConfig;
