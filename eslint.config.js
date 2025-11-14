// eslint.config.js

module.exports = {
  extends: [
    'plugin:compat/recommended',      // Reglas recomendadas para compatibilidad con navegadores y versiones de JavaScript
    'plugin:import/errors',           // Reglas para manejar errores relacionados con importaciones
    'plugin:import/warnings',         // Reglas para advertencias relacionadas con importaciones
    'plugin:unicorn/recommended',     // Reglas recomendadas por el plugin unicorn
    'xo',                             // Extiende las reglas de XO
    'xo/browser'                      // Extiende las reglas de XO para entornos de navegador
  ],
  env: {
    jquery: true,  // Asume que se está trabajando con jQuery
  },
  rules: {
    'arrow-body-style': 'off',           // Desactiva la regla para los cuerpos de las flechas
    'capitalized-comments': 'off',       // Desactiva la regla para comentarios con mayúsculas
    'comma-dangle': ['error', 'never'],  // No permite comas finales en objetos o arrays
    'eqeqeq': 'off',                     // Desactiva la regla de estricta comparación (===)
    'indent': ['error', 2, {             // Configura la indentación a 2 espacios
      'MemberExpression': 'off',
      'SwitchCase': 1,
    }],
    'multiline-ternary': ['error', 'always-multiline'],  // Exige ternarios multilíneas
    'new-cap': ['error', {               // Exige que los constructores de clases comiencen con mayúscula
      'properties': false,
    }],
    'no-eq-null': 'off',                 // Desactiva la regla de comparación con null
    'no-negated-condition': 'off',        // Desactiva la regla para evitar condiciones negadas
    'no-console': 'error',               // Prohíbe el uso de console.log
    'object-curly-spacing': ['error', 'always'],  // Exige espacios dentro de llaves de objetos
    'operator-linebreak': ['error', 'after'],  // Exige que los operadores estén al final de las líneas
    'prefer-template': 'error',          // Exige el uso de template strings en lugar de concatenación
    'prefer-named-capture-group': 'off', // Desactiva la regla para el uso de grupos de captura nombrados
    'semi': ['error', 'never'],          // Exige no usar punto y coma al final de las líneas
    // Reglas específicas de unicorn
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
  },
};
