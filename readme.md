# express-ws
Quickly implement websocket API in express.

There are some issues with [HenningM/express-ws](https://github.com/HenningM/express-ws), the author has not been active for more than 1 year. So I created this project.

This repository is not intended to be a replacement, but to provide options to solve a problem, you can view the [differences](#differences) here.

It may provide a solution for the following problems:
- https://github.com/HenningM/express-ws/issues/157
- https://github.com/HenningM/express-ws/issues/126
- https://github.com/HenningM/express-ws/issues/52

## Features
- [x] Use directly from app.ws
- [x] http and ws of the same route can exist at the same time
- [x] Support dynamic routing
- [x] Support reading params, query parameters

## how to use

``` sh
npm i @wll8/express-ws
```

``` js
const express = require(`express`)
const expressWs = require(`@wll8/express-ws`)
const app = express()
expressWs(app)

app.ws(`/abc`, (ws, req) => {
  // const {params, query} = req
  ws.send(`abc`)
})
app.get(`/abc`, (req, res) => {
  res.json(`abc`)
})

app.listen(3040)
```

- For more examples see the file: [test.js](./test/index.test.js)
- dependencies
  ```
  "path-to-regexp": "0.1.7",
  "ws": "7.5.5"
  ```
## differences

**Initialization**
| HenningM | wll8 | Remark |
| --- | --- | --- |
| expressWs(app) | expressWs(app) | express instance |
| expressWs(app, server) | expressWs({app, server}) | http.createServer(app) |
| expressWs(app, server, options) | expressWs({app, server, options}) | Other configuration |
| options.leaveRouterUntouched | --- | wll8: No |
| options.wsOptions | options.ws | wll8: initialization parameters for each ws api |

**return value**
| HenningM | wll8 | Remark |
| --- | --- | --- |
| wsInstance.app | wsInstance.app | wll8: same as app |
| wsInstance.getWss | --- | wll8: No |
| wsInstance.applyTo | --- | wll8: No |
| --- | wsInstance.wsRoute[] | [{route, wss, mid}](https://github.com/wll8/express-ws/blob/main/index.js#L44) |

**Parse the request**
| HenningM | wll8 | Remark |
| --- | --- | --- |
| --- | req.params | Parameters in routes |
| --- | req.query | query parameter |

## todo
- [ ] [Use typescript to achieve automatic prompting](https://github.com/wll8/express-ws/issues/1), does anyone have some help?

## License
[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2022-present, wll8