import { Server, WebSocket, ServerOptions } from 'ws'
import { Server as httpServer } from 'http'
import { Application } from 'express'
import { IncomingMessage } from "http"

export interface wsIncomingMessage extends IncomingMessage {
  /**
 * Parse parameters in path, /books/:id => {id: '...'}
 */
    params: {
    [key: string]: undefined | string,
  },

  /**
 * Parse query parameters, Arrays are not currently supported
 */
  query: {
    [key: string]: undefined | string,
  },
}


export type WsMid = ((ws: WebSocket, req: wsIncomingMessage) => void)

export interface wsRouteItem {
  /**
 * Route parameter, it can be in the form of /books/:id, array is not supported yet.
 */
  route: string,

  /**
 * new Server({ noServer: true })
 */
  wss: Server,

  /**
 * your websocket api handler
 */
  mid: WsMid,
}

export interface wsApplication extends Application {
  ws: (route: string, mid: WsMid) => void;
}

export type Arg0Full = {
  app: Application,
  server: httpServer,
  options?: {
    ws: ServerOptions
  },
}

export type Arg0 = Application | Arg0Full
