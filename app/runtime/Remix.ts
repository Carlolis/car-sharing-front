import type { Path } from '@effect/platform'
import { HttpServerRequest } from '@effect/platform'
import { Response } from '@effect/platform-node/Undici'
import type * as FileSystem from '@effect/platform/FileSystem'
import { fromWeb } from '@effect/platform/HttpServerRequest'
import type { Scope } from 'effect'
import { Cause, Context, Exit, Layer, ManagedRuntime, Match, pipe } from 'effect'
import type { NoSuchElementException } from 'effect/Cause'
import * as T from 'effect/Effect'
import type { ParseError, Unexpected } from 'effect/ParseResult'
import type { ActionFunctionArgs, LoaderFunctionArgs, Params as RemixParams } from 'react-router'
import { data, redirect } from 'react-router'
import { SessionStorage } from '~/session'
import { ConfigLive } from './Config'
import type { CookieSessionStorage } from './CookieSessionStorage'
import { CookieSessionStorageLayer } from './CookieSessionStorage'
import { ResponseHeaders } from './ResponseHeaders'
import { AppLayer, DevToolsLive } from './Runtime'
import type { FormError, NotFound, Redirect } from './ServerResponse'
type Serializable =
  | undefined
  | null
  | boolean
  | string
  | symbol
  | number
  | Array<Serializable>
  | {
    [key: PropertyKey]: Serializable
  }
  | bigint
  | Date
  | URL
  | RegExp
  | Error
  | Map<Serializable, Serializable>
  | Set<Serializable>
  | Promise<Serializable>
  | object

interface Params {
  readonly _: unique symbol
}
const Params = Context.GenericTag<Params, RemixParams>('@services/Params')
type AppEnv = Layer.Layer.Success<typeof AppLayer>

type RequestEnv =
  | HttpServerRequest.HttpServerRequest
  | FileSystem.FileSystem
  | Params
  | Scope.Scope
  | Path.Path
  | ResponseHeaders
  | CookieSessionStorage
  | SessionStorage

type ActionError = Redirect | Unexpected | FormError | ParseError | NotFound

type RemixActionHandler<A, R,> = T.Effect<
  A,
  ActionError,
  R | AppEnv | RequestEnv
>

type LoaderError = Redirect | NotFound | Unexpected | NoSuchElementException

type RemixLoaderHandler<A extends Serializable, R,> = T.Effect<
  A,
  LoaderError,
  R | AppEnv | RequestEnv
>
type LoaderArgs = LoaderFunctionArgs

type ActionArgs = ActionFunctionArgs

const matchLoaderError = Match.typeTags<Redirect | NotFound | Unexpected | NoSuchElementException>()
const matchActionError = Match.typeTags<ActionError>()
const makeRequestContext = (
  args: LoaderArgs | ActionArgs
): Layer.Layer<HttpServerRequest.HttpServerRequest | ResponseHeaders | Params, never, never> => {
  const context = Context.empty().pipe(
    Context.add(HttpServerRequest.HttpServerRequest, fromWeb(args.request)),
    Context.add(Params, args.params),
    Context.add(ResponseHeaders, args.request.headers),
    Layer.succeedContext
  )

  return context
}

const runtime = pipe(AppLayer, ManagedRuntime.make)
const loader = <A extends Serializable, R extends AppEnv | RequestEnv,>(
  effect: RemixLoaderHandler<A, R>
) => ((args: LoaderFunctionArgs) => {
  const runnable = effect.pipe(
    T.tapError(e =>
      T.sync(() =>
        matchLoaderError({
          Unexpected: () => Response.json({ status: 500 }),

          Redirect: () => Response.json({ status: 500 }),
          // {
          //   args.response.status = 302
          //   args.response.headers.set('Location', e.location)
          //   args.response.headers.set('Set-Cookie', e.headers?.['Set-Cookie'] ?? '')
          // },
          NoSuchElementException: () => Response.json({ status: 500 }),
          NotFound: () => Response.json({ status: 500 })
        })(e)
      )
    ),
    T.scoped,
    T.provide(CookieSessionStorageLayer),
    T.provide(SessionStorage.Default),
    T.provide(ConfigLive),
    T.provide(makeRequestContext(args)),
    T.provide(DevToolsLive),
    T.exit
  )

  return runtime.runPromise(runnable).then(
    Exit.getOrElse(cause => {
      if (Cause.isFailType(cause)) {
        throw Response.json(cause.error.toString, {
          status: 500,
          headers: undefined
        })
      }

      throw Cause.pretty(cause)
    })
  ) as Promise<A>
})

const handleFailedResponse = <E extends Serializable,>(cause: Cause.Cause<E>) => {
  if (Cause.isFailType(cause)) {
    throw cause.error
  }

  throw Cause.pretty(cause)
}

const action = <A extends Serializable, R extends AppEnv | RequestEnv,>(
  effect: RemixActionHandler<A, R>
) => ((args: ActionFunctionArgs) => {
  const runnable = effect.pipe(
    T.catchAll(e =>
      T.sync(() =>
        matchActionError({
          Unexpected: () => data({ status: 500 }),
          FormError: () => data({ status: 400 }),
          Redirect: e => redirect(e.location, { headers: e.headers, status: 302 }),
          ParseError: () => data({ status: 400 }),
          NotFound: () => data({ status: 404 })
        })(e)
      )
    ),
    // T.catchTag('FormError', e => T.succeed(e.toJSON())),
    // TODO: map FormError to ErrorResponse
    T.scoped,
    T.provide(CookieSessionStorageLayer),
    T.provide(SessionStorage.Default),
    T.provide(ConfigLive),
    T.provide(makeRequestContext(args)),
    T.provide(DevToolsLive),
    T.exit
  )

  return runtime.runPromise(runnable).then(Exit.getOrElse(handleFailedResponse)) as Promise<
    A
  >
})

const unwrapLoader = <
  A1 extends Serializable,
  R1 extends AppEnv | RequestEnv,
  E,
  R2 extends AppEnv,
>(
  effect: T.Effect<RemixLoaderHandler<A1, R1>, E, R2>
) => {
  const awaitedHandler = runtime.runPromise(effect).then(loader)

  return (args: LoaderArgs): Promise<A1> => awaitedHandler.then(handler => handler(args))
}

const unwrapAction = <
  A1 extends Serializable,
  R1 extends AppEnv | RequestEnv,
  E,
  R2 extends AppEnv,
>(
  effect: T.Effect<RemixActionHandler<A1, R1>, E, R2>
) => {
  const awaitedHandler = runtime.runPromise(effect).then(action)

  return (args: ActionArgs): Promise<A1> => awaitedHandler.then(handler => handler(args))
}

export const Remix = { action, loader, unwrapLoader, unwrapAction }
