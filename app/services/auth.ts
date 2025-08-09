import { HttpBody, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'

import * as T from 'effect/Effect'
import { HttpService } from './httpClient'

export class AuthService extends T.Service<AuthService>()('AuthService', {
  effect: T.gen(function* () {
    const { defaultClient, deleteRequest } = yield* HttpService

    const login = (username: string) =>
      T.gen(function* () {
        yield* T.logInfo(`AuthService login url : ${deleteRequest.url}/login`)
        const loginUrl = pipe(deleteRequest, HttpClientRequest.appendUrl('/login'))

        const body = yield* HttpBody.json({ name: username })
        const loginRequest = pipe(
          loginUrl,
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(loginRequest)
        yield* T.logInfo('AuthService login http response :', response)

        return yield* HttpClientResponse.schemaBodyJson(Sc.Struct({ token: Sc.String }))(response)
      }).pipe(
        T.annotateLogs(AuthService.name, login.name)
      )

    return ({
      login
    })
  })
}) {}

export const AuthLayer = AuthService.Default
