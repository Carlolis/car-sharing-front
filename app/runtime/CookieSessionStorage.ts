import { HttpServerRequest } from '@effect/platform'

// import { json, TypedResponse } from 'react-router';
import { Context, Effect as T, pipe, Schema as Sc } from 'effect'
import * as O from 'effect/Option'
import { redirect } from 'react-router'
import { commitSession, getSession } from '~/session'
import { NotAuthenticated } from './NotAuthenticatedError'
import { ServerResponse } from './ServerResponse'
// import { JwtUserInfo } from '~/routes/callback'
// import { commitSession, getSession } from '~/session'
// import { NotAuthenticated } from '../models/NotAuthenticatedError'
// import { Redirect, ServerResponse } from '../ServerResponse'

const UserInfo = Sc.Struct({
  username: Sc.String,
  token: Sc.String
})

type UserInfo = Sc.Schema.Type<typeof UserInfo>

export class CookieSessionStorage
  extends T.Service<CookieSessionStorage>()('CookieSessionStorage', {
    effect: T.gen(function* (_) {
      const optionalCookies: O.Option<string> = yield* _(
        HttpServerRequest.schemaHeaders(Sc.Struct({ cookie: Sc.String })),
        T.mapError(e => NotAuthenticated.of(e.message)),
        T.map(headers => O.some(headers.cookie)),
        T.tapError(e => T.logError(`CookieSessionStorage - get cookies for service`, e.message)),
        T.catchAll(() => T.succeed(O.none()))
      )

      const commitUserInfo = (userInfo: UserInfo) =>
        T.gen(function* (_) {
          const session = yield* _(T.promise(() =>
            pipe(
              optionalCookies,
              O.getOrUndefined,
              cookies =>
                getSession(
                  cookies
                )
            )
          ))
          yield* T.logInfo(`CookieSessionStorage - commitUserInfo`, userInfo, session)

          session.set('user_info', userInfo)

          const cookie = yield* _(T.promise(() => commitSession(session)))

          return redirect('/dashboard', { headers: { 'Set-Cookie': cookie } })
        })

      const getUserToken = () =>
        T.gen(function* (_) {
          const cookies = yield* _(
            optionalCookies,
            T.catchAll(() => {
              return ServerResponse.Redirect({
                location: '/login'
              })
            })
          )

          const session = yield* _(T.promise(() =>
            getSession(
              cookies
            )
          ))

          const token = yield* _(
            session.get('user_info'),
            Sc.decodeUnknown(UserInfo),
            T.map(({ token }) => token),
            T.mapError(e => NotAuthenticated.of(e.message)),
            T.tapError(e => T.logError(`CookieSessionStorage - getUserToken`, e)),
            T.catchAll(() =>
              ServerResponse.Redirect({
                location: '/login'
              })
            )
          )

          return token
        })
      const getUserName = () =>
        T.gen(function* (_) {
          const cookies = yield* _(
            optionalCookies,
            T.catchAll(() => {
              return T.succeed(undefined)
            })
          )

          const session = yield* _(T.promise(() =>
            getSession(
              cookies
            )
          ))

          return yield* _(
            session.get('user_info'),
            Sc.decodeUnknown(UserInfo),
            T.map(({ username }) => username),
            T.catchAll(() => T.succeed(undefined))
          )
        })
      return {
        getUserToken,
        getUserName,
        commitUserInfo
      }
    })
  }) {}

export class CookieSession
  extends Context.Tag('CookieSessionStorage')<CookieSessionStorage, CookieSessionStorage>() {
}

export const CookieSessionStorageLayer = CookieSessionStorage.Default
