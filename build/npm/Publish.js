#!/usr/bin/env node

'use strict'

const path = require('path')
const fse = require('fs-extra')
const Plugins = require('./Plugins')

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
      const fseOptions = {
        // Follow pnpm's package symlinks so directories are copied as directories
        dereference: true,
        // Skip copying dot files
        filter(src, dest) {
          if (path.basename(src).startsWith('.') || (module.filter && !module.filter(src))) {
            return false
          }

          try {
            if (fse.statSync(src).isFile() && fse.statSync(dest).isFile() && fse.readFileSync(src).equals(fse.readFileSync(dest))) {
              return false
            }
          } catch {}

          return true
        }
      }

      try {
        if (!fse.existsSync(module.from)) {
          throw new Error(`Source path does not exist: ${module.from}`)
        }

        fse.copySync(module.from, module.to, fseOptions)

        if (this.options.verbose) {
          console.log(`Copied ${module.from} to ${module.to}`)
        }
      } catch (error) {
        console.error(`Error: ${error}`)
        process.exitCode = 1
      }
    })
  }
}

(new Publish()).run()
