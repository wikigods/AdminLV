#!/usr/bin/env node

'use strict'

const path = require('path')
const fse = require('fs-extra')
const fs = require('fs')
const Plugins = require('./DocsPlugins')

class Publish {
  constructor() {
    this.options = {
      verbose: false
    }

    this.getArguments()
  }

  getArguments() {
    if (process.argv.length > 2) {
      const arg = process.argv[2]
      switch (arg) {
        case '-v':
        case '--verbose':
          this.options.verbose = true
          break
        default:
          throw new Error(`Unknown option ${arg}`)
      }
    }
  }

  run() {
    // Publish files
    Plugins.forEach(module => {
      try {
        fse.copySync(module.from, module.to, {
          // Follow pnpm's package symlinks so directories are copied as directories
          dereference: true,
          // Skip copying dot files
          filter(src, dest) {
            if (path.basename(src).startsWith('.')) {
              return false
            }

            try {
              if (fse.statSync(src).isFile() && fse.statSync(dest).isFile() && fse.readFileSync(src).equals(fse.readFileSync(dest))) {
                return false
              }
            } catch {}

            return true
          }
        })

        if (this.options.verbose) {
          console.log(`Copied ${module.from} to ${module.to}`)
        }
      } catch (error) {
        console.error(`Error: ${error}`)
        process.exitCode = 1
      }
    })

    const insertText = '---\r\nlayout: page\r\ntitle: \r\n---\r\n'

    fs.writeFileSync('docs/how-to-contribute.md', insertText + fs.readFileSync('.github/CONTRIBUTING.md', 'utf8'))
  }
}

(new Publish()).run()
