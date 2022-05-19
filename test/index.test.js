const express = require(`express`)
const expressWs = require(`..`)
const app = express()
expressWs(app)

app.ws(`/ws1`, (ws, req) => {
  ws.send(`ws1`)
})
app.ws(`/ws2`, (ws, req) => {
  ws.send(`ws2`)
})
app.ws(`/ws/:id`, (ws, req) => {
  ws.send(JSON.stringify({
    url: req.url,
    params: req.params,
    query: req.query,
  }))
})
app.ws(`/ws/:name/login/:token`, (ws, req) => {
  ws.send(JSON.stringify({
    url: req.url,
    params: req.params,
    query: req.query,
  }))
})
// No http conflict with same path
app.ws(`/abc`, (ws, req) => {
  ws.send(`abc`)
})
app.get(`/abc`, (req, res) => {
  res.json(`abc`)
})
app.listen(3040)


console.log(`expressWs`, expressWs)