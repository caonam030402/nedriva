/**
 * Single source of truth for formatting. Re-used in `eslint.config.mjs` → `formatters.prettierOptions`
 * so `npm run format` and ESLint `format/prettier` (CSS, etc.) stay aligned.
 * Conflicting ESLint stylistic rules are turned off last via `eslint-config-prettier/flat`.
 */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'always',
};
