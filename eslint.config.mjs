import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Désactive les règles ESLint qui entrent en conflit avec Prettier.
  prettier,
  {
    rules: {
      // Pas de console.log oublié ; warn/error restent autorisés.
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // TypeScript strict : interdiction de `any` explicite.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
