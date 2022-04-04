const connect = require('connect')
const blockFavicon = require('connect-block-favicon')
const morgan = require('morgan')
const serveIndex = require('serve-index')
const serveStatic = require('serve-static')

function startServer ({ root = '.', port = +(process.env.PORT || 8967) } = {}) {
  return new Promise((resolve, reject) => {
    const server = connect()
      .use(morgan('dev'))
      .use(blockFavicon())
      .use(serveIndex(root))
      .use(serveStatic(root, { etag: false }))
      .on('error', reject)
      .listen(port, () => {
        console.log(`Listening at http://localhost:${port}...`)
        resolve({ server, port })
      })
  })
}

startServer().catch(error => {
  console.error(error)
  process.exitCode = 1
})
