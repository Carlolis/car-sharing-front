import { HttpBody, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'

import * as T from 'effect/Effect'
import { HttpService } from './httpClient'

export class IAService extends T.Service<IAService>()('IAService', {
  effect: T.gen(function* () {
    const { defaultClient, postRequest } = yield* HttpService

    const createChat = (writerId: string, name: string) =>
      T.gen(function* () {
        const body = yield* HttpBody.json({ writerId, name })
        const createChatRequest = pipe(
          postRequest,
          HttpClientRequest.appendUrl('/ia/createChat'),
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(createChatRequest)
        const responseJson = yield* response.json
        yield* T.logInfo('responseJson', responseJson)
        return yield* HttpClientResponse.schemaBodyJson(Sc.String)(response)
      })

    const addMessageToChat = (chatUuid: string, message: { question: string; answer: string }) =>
      T.gen(function* () {
        const body = yield* HttpBody.json({ chatUuid, message })
        const createChatRequest = pipe(
          postRequest,
          HttpClientRequest.appendUrl('/ia/addMessage'),
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setBody(body)
        )
        const response = yield* defaultClient.execute(createChatRequest)
        const responseJson = yield* response.json
        yield* T.logInfo('responseJson', responseJson)
        return yield* HttpClientResponse.schemaBodyJson(Sc.String)(response)
      })

    return ({
      createChat,
      addMessageToChat
    })
  })
}) {}

export const IALayer = IAService.Default
