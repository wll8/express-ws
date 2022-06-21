/**
 * https://github.com/expressjs/express/issues/2594
 * https://github.com/websockets/ws#multiple-servers-sharing-a-single-https-server
 */

const pathToRegexp = require(`path-to-regexp`)
const { Server } = require(`ws`)
const http = require(`http`)

/**
 * Quickly implement websocket API in express
 * @param {*} app or {app: express(), server: http.createServer(app)}
 */
function expressWs(arg0) {
  let cfg = {
    options: {
      ws: { noServer: true },
    },
  }
  if(typeof(arg0) === `function`) { // express()
    cfg.app = arg0
    cfg.server = http.createServer(arg0)
  } else if(typeof(arg0) === `object`) {
    cfg = {
      ...arg0,
      options: {...cfg.options, ...arg0.options},
    }
  }
  const {app, server} = cfg
  app.wsRoute = []
  server.on(`upgrade`, (req, socket, head) => {
    const obj = app.wsRoute.find(item => {
      const isFind = pathToRegexp(item.route).exec(req.url)
      if(isFind) {
        req.params = parseParams(item.route, req.url)
        req.query = parseQuery(req.url)
      }
      return isFind
    })
    obj ? obj.wss.handleUpgrade(req, socket, head, ws => obj.mid(ws, req)) : socket.destroy()
  })
  app.listen = (...arg) => server.listen(...arg)
  app.ws = (route, mid) => {
    app.wsRoute.push({
      route,
      wss: new Server(cfg.options.ws),
      mid,
    })
  }
}

/**
 * Get query parameter from url
 * @param {*} url 
 * @returns 
 */
function parseQuery(url) {
  const fullUrl = url.includes(`:`) ? url : `ws://x${url}`
  const query = [...new URLSearchParams(new URL(fullUrl).search)].reduce((acc, [key, val]) => {
    acc[key] = val
    return acc
  }, {})
  return query
}


/**
 * Use path-to-regexp to convert express's router, and parse parameters as objects
 * @param {*} rePath original route
 * @param {*} url url with parameters
 */
function parseParams(rePath, url) {
  const fullUrl = url.includes(`:`) ? url : `ws://x${url}`
  const keys = []
  const re = pathToRegexp(rePath, keys)
  const pathname = new URL(fullUrl).pathname
  const result = re.exec(pathname)
  const obj = keys.reduce((acc, cur, index) => {
    acc[cur.name] = result[index + 1]
    return acc
  }, {})
  return obj
}

module.exports = expressWs