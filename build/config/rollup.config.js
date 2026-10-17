'use strict'

const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

const pkg = require('../../package')
const year = new Date().getFullYear()
const banner = `/*!
 * AdminLV v${pkg.version} (${pkg.homepage})
 * Copyright 2014-${year} ${pkg.author}
 * Licensed under MIT (https://github.com/ColorlibHQ/AdminLTE/blob/master/LICENSE)
 */`

module.exports = {
  input: 'build/js/AdminLV.js',
  output: {
    banner,
    file: 'dist/js/adminlv.js',
    format: 'umd',
    name: 'adminlte'
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: 'node_modules/**',
      // Include the helpers in the bundle, at most one copy of each
      babelHelpers: 'bundled'
    })
  ]
}
