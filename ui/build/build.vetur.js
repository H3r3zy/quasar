const
  path = require('path')

const
  { logError, writeFile } = require('./build.utils'),
  resolve = file => path.resolve(__dirname, '../dist/vetur', file),
  kebabRegex = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g

function kebabCase (str) {
  return str.replace(
    kebabRegex,
    match => '-' + match.toLowerCase()
  ).substring(1)
}

function getTags (data) {
  const tags = {}

  data.forEach(comp => {
    tags[comp.name] = {
      attributes: Object.keys(comp.props),
      description: ''
    }
  })

  return tags
}

function getAttributes (data) {
  const attrs = {}

  data.forEach(comp => {
    Object.keys(comp.props).forEach(propName => {
      const prop = comp.props[propName]

      attrs[`${comp.name}/${propName}`] = {
        type: Array.isArray(prop.type)
          ? prop.type.map(t => t.toLowerCase()).join('|')
          : prop.type.toLowerCase(),
        description: prop.desc
      }
    })
  })

  return attrs
}

module.exports.generate = function ({ components }) {
  const data = components.map(c => ({
    name: kebabCase(c.name),
    props: c.api.props || {}
  }))

  try {
    writeFile(
      resolve('quasar-tags.json'),
      JSON.stringify(getTags(data), null, 2)
    )

    writeFile(
      resolve('quasar-attributes.json'),
      JSON.stringify(getAttributes(data), null, 2)
    )
  }
  catch (err) {
    logError(`build.vetur.js: something went wrong...`)
    console.log()
    console.error(err)
    console.log()
    process.exit(1)
  }
}
