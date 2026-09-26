import * as http from "http"
import express from "express"
import { AddressInfo } from "net"
import { WebSocket } from "ws"
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import expressWs from "../src/index"
import { wsApplication, wsRouteItem } from "../src/type"

/**
 * Connect to a ws route and wait for the first message
 */
function receive(url: string, timeoutMs = 3000): Promise<string> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const timer = setTimeout(() => {
      ws.terminate()
      reject(new Error(`timeout: ${url}`))
    }, timeoutMs)
    ws.on(`message`, m => {
      clearTimeout(timer)
      ws.close()
      resolve(m.toString())
    })
    ws.on(`error`, e => {
      clearTimeout(timer)
      reject(e)
    })
  })
}

/**
 * Get the listen port from a server listening on a random port
 */
function serverPort(server: http.Server): number {
  return (server.address() as AddressInfo).port
}

describe(`expressWs({app, server})`, () => {
  let server: http.Server
  let wsRoute: wsRouteItem[]
  let base: string
  const sockets = new Set<import('net').Socket>()

  beforeAll(() => {
    const app = express()
    const result = expressWs({
      app,
      server: http.createServer(app),
    })
    const wsApp: wsApplication = result.app
    wsRoute = result.wsRoute
    wsApp.ws(`/ws1`, ws => ws.send(`ws1`))
    wsApp.ws(`/ws/:id`, (ws, req) => ws.send(JSON.stringify({ params: req.params, query: req.query })))
    wsApp.ws(`/ws/:name/login/:token`, (ws, req) => ws.send(JSON.stringify({ params: req.params, query: req.query })))
    // No http conflict with same path
    wsApp.ws(`/abc`, ws => ws.send(`abc`))
    wsApp.get(`/abc`, (req, res) => {
      res.json(`abc`)
    })
    server = wsApp.listen(0)
    // Track raw sockets: an unmatched upgrade socket leaves the http server
    // pool, so closeAllConnections cannot reach it during cleanup
    server.on(`connection`, s => {
      sockets.add(s)
      s.on(`close`, () => sockets.delete(s))
    })
    base = `ws://127.0.0.1:${serverPort(server)}`
  })

  afterAll(async () => {
    wsRoute.forEach(item => item.wss.close())
    sockets.forEach(s => s.destroy())
    await new Promise(resolve => server.close(resolve))
  })

  it(`exact route`, async () => {
    expect(await receive(`${base}/ws1`)).toBe(`ws1`)
  })

  it(`case-insensitive route (path-to-regexp v8 default)`, async () => {
    expect(await receive(`${base}/WS1`)).toBe(`ws1`)
  })

  it(`single path param`, async () => {
    const data = JSON.parse(await receive(`${base}/ws/123`))
    expect(data.params).toEqual({ id: `123` })
  })

  it(`multiple path params`, async () => {
    const data = JSON.parse(await receive(`${base}/ws/bob/login/tok123`))
    expect(data.params).toEqual({ name: `bob`, token: `tok123` })
  })

  it(`query string parsing`, async () => {
    const data = JSON.parse(await receive(`${base}/ws/123?a=1&b=x`))
    expect(data.query).toEqual({ a: `1`, b: `x` })
  })

  it(`ws and http coexist on the same path`, async () => {
    expect(await receive(`${base}/abc`)).toBe(`abc`)
    const res = await fetch(`http://127.0.0.1:${serverPort(server)}/abc`)
    expect(await res.json()).toBe(`abc`)
  })

  it(`unmatched route is not upgraded`, async () => {
    await expect(receive(`${base}/no-match`, 500)).rejects.toThrow(/timeout/)
  })
})

describe(`expressWs(app)`, () => {
  it(`creates the http server internally`, async () => {
    const app = express()
    const { app: wsApp, wsRoute } = expressWs(app)
    wsApp.ws(`/solo`, ws => ws.send(`solo`))
    const server = wsApp.listen(0)
    const msg = await receive(`ws://127.0.0.1:${serverPort(server)}/solo`)
    wsRoute.forEach(item => item.wss.close())
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
    expect(msg).toBe(`solo`)
  })
})
