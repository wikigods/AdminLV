import fs from 'fs-extra'

try {
  fs.copySync('./build/assets', './dist/assets')
  console.log('Assets copy success!')
} catch (error) {
  console.error(error)
}
