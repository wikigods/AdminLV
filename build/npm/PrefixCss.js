'use strict'

const fs = require('node:fs/promises')
const path = require('node:path')
const postcss = require('postcss')
const config = require('../config/postcss.config.js')

const directory = path.resolve(process.argv[2] || 'dist/css')

async function prefixCssFiles() {
  const files = (await fs.readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css') && !entry.name.endsWith('.min.css'))
    .map((entry) => path.join(directory, entry.name))
    .sort()

  for (const file of files) {
    const css = await fs.readFile(file, 'utf8')
    const result = await postcss(config.plugins).process(css, {
      from: file,
      to: file,
      map: config.map,
    })

    if (result.map) {
      const mapFile = `${file}.map`
      await fs.writeFile(mapFile, result.map.toString())
    }

    await fs.writeFile(file, result.css)
  }
}

prefixCssFiles().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
