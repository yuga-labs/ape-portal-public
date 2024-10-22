module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'plugin:unicorn/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:tailwindcss/recommended',
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
    'node_modules',
    'coverage',
    'vite-env.d.ts',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['unicorn', 'react-refresh'],
  rules: {
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
    'tailwindcss/no-custom-classname': [
      'error',
      {
        callees: ['clsx', 'cn'],
        classRegex: '^(class(Name)?|wrapperClass)$',
      },
    ],
  },
};
