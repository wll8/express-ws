/**
 * https://github.com/expressjs/express/issues/2594
 * https://github.com/websockets/ws#multiple-servers-sharing-a-single-https-server
 */

const { Server } = require(`ws`)
const http = require(`http`)

/**
 * Quickly implement websocket API in express
 * @param {*} app express()
 */
function expressWs(app) {
  const server = http.createServer(app)
  server.on(`upgrade`, (req, socket, head) => {
    const obj = app.wsRoute[req.url]
    obj ? obj.wss.handleUpgrade(req, socket, head, ws => obj.mid(ws, req)) : socket.destroy()
  })
  app.listen = (...arg) => server.listen(...arg)
  app.ws = (route, mid) => {
    app.wsRoute = app.wsRoute || {}
    app.wsRoute[route] = {
      wss: new Server({ noServer: true }),
      mid,
    }
  }
}

module.exports = expressWs