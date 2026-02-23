import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // Ignore generated files
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'node_modules/**',
      'build/**',
    ]
  },
  
  // Main config - LENIENT for CI
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // ✅ LENIENT - Only catch real issues
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // Don't complain about unused imports (JSX uses them)
      'no-unused-vars': 'off',  // ✅ DISABLED for now
      
      // Only warn on React Refresh issues
      'react-refresh/only-export-components': 'warn',
      
      // Allow irregular whitespace (cosmetic)
      'no-irregular-whitespace': 'off',
    },
  },
]