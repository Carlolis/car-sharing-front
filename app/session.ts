import { pipe } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { createCookieSessionStorage } from 'react-router'
import { Config } from './runtime/Config'

export class SessionStorage extends T.Service<SessionStorage>()('SessionStorage', {
  effect: T.gen(function* () {
    yield* T.logDebug('SessionStorage initialized')
    const { SECRET, DOMAIN } = yield* pipe(Config, T.flatMap(c => c.getConfig))
    yield* T.logDebug(`SessionStorage - Loaded configuration: SECRET=${SECRET}, DOMAIN=${DOMAIN}`)

    const sessionStorage = createCookieSessionStorage({
      cookie: {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        name: '_session', // use any name you want here
        sameSite: 'lax', // this helps with CSRF
        path: '/', // remember to add this so the cookie will work in all routes
        httpOnly: true, // for security reasons, make this cookie http only
        secrets: [SECRET],
        secure: true,
        domain: DOMAIN
      }
    })
    return { ...sessionStorage }
  })
}) {}
