const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const svgPath = path.join(__dirname, '..', 'public', 'rupee.svg')
const svgBuf = fs.readFileSync(svgPath)

const androidRes = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res')

// mipmap sizes for regular icons
const mipmaps = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
]

// foreground for adaptive icon (108dp with 72dp safe zone = 1.5x)
const adaptiveSizes = [
  { dir: 'mipmap-mdpi',    size: 108 },
  { dir: 'mipmap-hdpi',    size: 162 },
  { dir: 'mipmap-xhdpi',   size: 216 },
  { dir: 'mipmap-xxhdpi',  size: 324 },
  { dir: 'mipmap-xxxhdpi', size: 432 },
]

async function generate() {
  for (const { dir, size } of mipmaps) {
    const out = path.join(androidRes, dir, 'ic_launcher.png')
    await sharp(svgBuf).resize(size, size).png().toFile(out)
    console.log('wrote', out)

    const outRound = path.join(androidRes, dir, 'ic_launcher_round.png')
    await sharp(svgBuf).resize(size, size).png().toFile(outRound)
    console.log('wrote', outRound)
  }

  for (const { dir, size } of adaptiveSizes) {
    const out = path.join(androidRes, dir, 'ic_launcher_foreground.png')
    await sharp(svgBuf).resize(size, size).png().toFile(out)
    console.log('wrote', out)
  }

  console.log('Done!')
}

generate().catch(console.error)
