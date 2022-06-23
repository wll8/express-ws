import * as http from "http"
import * as express from "express"
import expressWs = require("../src/index")
const app = express()
const { app: wsApp, wsRoute } = expressWs({
  app,
  server: http.createServer(app)
})
wsApp.ws(`/ws1`, (ws, req) => {
  ws.send(`ws1`)
})
wsApp.ws(`/ws2`, (ws, req) => {
  ws.send(`ws2`)
})
wsApp.ws(`/ws/:id`, (ws, req) => {
  ws.send(JSON.stringify({
    url: req.url,
    params: req.params,
    query: req.query,
  }))
})
wsApp.ws(`/ws/:name/login/:token`, (ws, req) => {
  ws.send(JSON.stringify({
    url: req.url,
    params: req.params,
    query: req.query,
  }))
})
// No http conflict with same path
wsApp.ws(`/abc`, (ws, req) => {
  ws.send(`abc`)
})
wsApp.get(`/abc`, (req, res) => {
  res.json(`abc`)
})
wsApp.listen(3040)

console.log(`expressWs`, expressWs)