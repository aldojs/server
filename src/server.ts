
import * as net from 'net'
import * as http from 'http'
import * as https from 'https'
import Request from './request'
import Response from './response'
import { setImmediate } from 'timers'

export default class Server {
  private _options: {}

  /**
   * Initialize a Server instance
   * 
   * @param native HTTP(S) server instance
   * @param options
   */
  public constructor (public native: http.Server | https.Server, options = {}) {
    this._options = options
  }

  /**
   * Add a `listener` for the given `event`
   * 
   * @param event
   * @param fn listener
   */
  public on (event: string, fn: (...args: any[]) => void): this {
    if (event === 'request') fn = this._wrap(fn)

    this.native.on(event, fn)
    return this
  }

  /**
   * Start a server listening for requests
   * 
   * @param options
   */
  public start (options: { port?: number, host?: string }): Promise<void>
  /**
   * Start a server listening for requests
   * 
   * @param port
   */
  public start (port: number): Promise<void>
  public start (options: any) {
    if (typeof options === 'number') {
      options = { port: options }
    }

    return new Promise<void>((resolve, reject) => {
      this.native.listen(options, (err: any) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * Stops the server from accepting new requests
   */
  public stop (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.native.close((err: any) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * Wrap the `request` event listener
   * 
   * @param fn event listener
   * @private
   */
  private _wrap (fn: (...args: any[]) => void): (...args: any[]) => void {
    var opts = this._options

    return (req: http.IncomingMessage, res: http.ServerResponse) => {
      setImmediate(fn, new Request(req, opts), new Response(res, opts))
    }
  }
}
