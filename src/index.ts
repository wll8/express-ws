/**
 * https://github.com/expressjs/express/issues/2594
 * https://github.com/websockets/ws#multiple-servers-sharing-a-single-https-server
 */

import * as pathToRegexp from 'path-to-regexp'
import { Server } from 'ws'
import * as http from 'http'
import { 
  Arg0,
  Arg0Full,
  wsApplication,
  wsRouteItem,
  wsIncomingMessage,
 } from "./type"

/**
 * Get query parameter from url
 * @param {*} url 
 * @returns 
 */
function parseQuery(url) {
  const fullUrl = url.includes(`:`) ? url : `x://${url}`
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
  const fullUrl = url.includes(`:`) ? url : `x://${url}`
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

/**
 * Quickly implement websocket API in express
 */
function expressWs (arg0: Arg0) {
  let cfg: Arg0Full = {
    app: undefined,
    server: undefined,
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
  const wsApp: wsApplication = app as wsApplication
  const wsRoute = []
  server.on(`upgrade`, (req: wsIncomingMessage, socket, head) => {
    const obj = wsRoute.find(item => {
      const isFind = pathToRegexp(item.route).exec(new URL(`x://${req.url}`).pathname)
      if(isFind) {
        req.params = parseParams(item.route, req.url)
        req.query = parseQuery(req.url)
      }
      return isFind
    })
    obj && obj.wss.handleUpgrade(req, socket, head, ws => obj.mid(ws, req))
  })
  wsApp.listen = (...arg) => server.listen(...arg)
  wsApp.ws = (route, mid) => {
    wsRoute.push({
      route,
      wss: new Server(cfg.options.ws),
      mid,
    })
  }
  return {
    app: wsApp,
    wsRoute,
  }
}

export = expressWs
