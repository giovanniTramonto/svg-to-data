const fs = require('fs')
const rdf = require('read-dir-files')

const inputSVGs = './assets'
const dist = './dist/'
const outputSVG = 'icons-svg.scss'
const outputFills = 'icons-colors.scss'
const fillDefault = '#8c8c8c'
const fills = []

function filesToArray (files) {
  let items = []
  for (let fileName in files) {
    let name = extractFileName(fileName)
    items.push({
      name: name,
      data: encodeSvg(files[fileName], name)
    })
  }
  return items
}

function extractFileName (name) {
  let parts = name.split('.')
  return parts[0]
}

function encodeSvg (svg, name) {
  let parts = svg.match(/<[^>]*>/g)
  let encode = parts.map(part => encodePart(part, name))
  let data = 'data:image/svg+xml,' + encode.join('')
  return data
}

function encodePart (part, name) {
  /**
   * Attract fill modifier.
   * Then remove fill attr and multiple whitespace.
   * Encode.
   * And add SCSS fill variable.
   */
  let modifier = getFillModifier(part)
  let strip = part.replace(/fill="[^"]*"/, 'fill')
  let encode = encodeURI(strip)
  let fillVar = '$' + name + modifier + '-fill'
  if (fills.indexOf(fillVar) === -1) {
    fills.push(fillVar)
  }
  return encode.replace(/fill/, 'fill=%22#{' + fillVar + '}%22')
}

function getFillModifier (part) {
  let options = /(?:(\b\w+\b)\s*=\s*("[^"]*"|'[^']*'|[^"'<>\s]+)\s+)+/.exec(part)
  let modifier = ''
  if ((options || [])[1] === 'fill') {
    let m = options[2].replace(/"/g, '')
    modifier = '-' + m
  }
  return modifier
}

function getIconsMap (items) {
  let map = '$icons: (\n\n'
  map += items.map(f => '\t"' + f.name + '": "' + f.data + '"').join(',\n\n')
  map += '\n\n);'
  return map
}

function getIconsFills () {
  let vars = fills.map(fill => fill + ': ' + fillDefault + ' !default;')
  return vars.join('\n\n')
}

function createIcons (files) {
  let items = filesToArray(files)
  fs.writeFile((dist + outputSVG), getIconsMap(items), 'utf-8')
  fs.writeFile((dist + outputFills), getIconsFills(), 'utf-8')
}

rdf.read(inputSVGs, 'utf-8', function (err, files) {
  if (err) return console.dir(err)
  createIcons(files)
})
