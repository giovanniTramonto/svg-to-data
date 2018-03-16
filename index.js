const fs = require('fs')
const rdf = require('read-dir-files')

function objectToArray (obj) {
  let items = []
  for (let name in obj) {
    items.push({
      name: extractName(name),
      data: encodeSvg(obj[name])
    })
  }
  return items
}

function encodeSvg (svg) {
  let parts = svg.match(/<[^>]*>/g)
  let encode = encodeURI(parts.join(''))
  let data = 'data:image/svg+xml,' + encode
  return data
}

function extractName (name) {
  let parts = name.split('.')
  return parts[0]
}

function createIconMap (files) {
  let map = '$icons: (\n\n'
  map += objectToArray(files).map(f => '\t"' + f.name + '": "' + f.data + '"').join(',\n\n')
  map += '\n\n);'
  fs.writeFile('./dist/icons-svg.scss', map, 'utf-8')
}

rdf.read('./assets', 'utf-8', function (err, files) {
  if (err) return console.dir(err)
  createIconMap(files)
})
