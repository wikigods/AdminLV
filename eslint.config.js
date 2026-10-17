'use strict'

const { fixupConfigRules } = require('@eslint/compat')
const { FlatCompat } = require('@eslint/eslintrc')
const importX = require('eslint-plugin-import-x')
const globals = require('globals')

const compat = new FlatCompat({
  baseDirectory: __dirname
})

module.exports = [
  {
    ignores: [
      '**/*.min.js',
      '**/plugins/**',
      'dist/js/adminlv.js',
      'docs/**',
      'docs_html/**'
    ]
  },
  ...fixupConfigRules(compat.extends(
    'plugin:compat/recommended',
    'plugin:unicorn/recommended',
    'xo',
    'xo/browser'
  )),
  importX.flatConfigs.errors,
  importX.flatConfigs.warnings,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jquery,
        AirDatepicker: 'readonly'
      }
    },
    rules: {
      'arrow-body-style': 'off',
      'capitalized-comments': 'off',
      'comma-dangle': ['error', 'never'],
      eqeqeq: 'off',
      indent: ['error', 2, { MemberExpression: 'off', SwitchCase: 1 }],
      'multiline-ternary': ['error', 'always-multiline'],
      'new-cap': ['error', { properties: false }],
      'no-eq-null': 'off',
      'no-negated-condition': 'off',
      'no-console': 'error',
      'object-curly-spacing': ['error', 'always'],
      'operator-linebreak': ['error', 'after'],
      'prefer-template': 'error',
      'prefer-named-capture-group': 'off',
      semi: ['error', 'never'],
      'unicorn/filename-case': 'off',
      'unicorn/consistent-destructuring': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-for-loop': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-unused-properties': 'error',
      'unicorn/prefer-dom-node-append': 'off',
      'unicorn/prefer-dom-node-dataset': 'off',
      'unicorn/prefer-dom-node-remove': 'off',
      'unicorn/prefer-export-from': 'off',
      'unicorn/prefer-includes': 'off',
      'unicorn/prefer-number-properties': 'off',
      'unicorn/prefer-optional-catch-binding': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/prefer-set-has': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'no-new': 'off',
      'unicorn/consistent-existence-index-check': 'off',
      'unicorn/no-typeof-undefined': 'off',
      'unicorn/prefer-at': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/switch-case-braces': 'off'
    }
  },
  {
    files: ['dist/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script'
    },
    rules: {
      'no-var': 'off',
      'object-shorthand': 'off',
      'prefer-arrow-callback': 'off',
      strict: 'error',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/prefer-dataset': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-append': 'off',
      'unicorn/prefer-spread': 'off'
    }
  },
  {
    files: ['build/npm/**/*.js', 'build/config/**/*.js'],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      'no-console': 'off',
      strict: 'error',
      'unicorn/prefer-module': 'off'
    }
  }
]
