/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from 'node:stream'

import { createReadableStreamFromReadable } from '@react-router/node'
import { renderToPipeableStream } from 'react-dom/server'
import type { EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'

export const streamTimeout = 5_000_000

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
) {
  return new Promise((resolve, reject) => {
    let didError = false
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
      />,
      {
        onShellReady() {
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          )
          // @effect-diagnostics-next-line unnecessaryPipe:off this is not an Effect pipe it is for Remix
          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          didError = true
          // eslint-disable-next-line no-console
          console.error(error)
        }
      }
    )

    setTimeout(abort, 5000)
  })
}
