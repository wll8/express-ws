# express-ws
Quickly implement websocket API in express.

There are some issues with [HenningM/express-ws](https://github.com/HenningM/express-ws), the author has not been active for more than 1 year. So I created this project.

## Features
- [x] Use directly from app.ws
- [x] http and ws of the same route can exist at the same time
- [x] Support regexp routing
- [x] Support reading params, query parameters

## how to use

``` sh
npm i express-websocket
```

``` js
const express = require(`express`)
const expressWs = require(`express-websocket`)
const app = express()
expressWs(app)

app.ws(`/abc`, (ws, req) => {
  ws.send(`abc`)
})
app.get(`/abc`, (req, res) => {
  res.json(`abc`)
})

app.listen(3040)
```

## License
[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2022-present, wll8