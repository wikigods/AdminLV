'use strict'

const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

const pkg = require('../../package')
const year = new Date().getFullYear()
const banner = `/*!
 * AdminLV Legacy Icons v${pkg.version} (${pkg.homepage})
 * Copyright 2014-${year} ${pkg.author}
 * Licensed under MIT (https://github.com/ColorlibHQ/AdminLTE/blob/master/LICENSE)
 */`

module.exports = {
  input: 'build/js/FontAwesomeLegacy.js',
  output: {
    banner,
    file: 'dist/js/adminlv-legacy-icons.js',
    format: 'umd',
    name: 'adminlvLegacyIcons'
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled'
    })
  ]
}
