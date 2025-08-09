import { HttpClient, HttpClientRequest } from '@effect/platform'
import { pipe } from 'effect'

import * as T from 'effect/Effect'
import { Config } from '~/runtime/Config'

export class HttpService extends T.Service<HttpService>()('HttpService', {
  effect: T.gen(function* () {
    const API_URL = yield* pipe(Config, T.flatMap(c => c.getConfig), T.map(c => c.API_URL))
    const defaultClient = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk)

    const deleteRequest = HttpClientRequest.del(`${API_URL}`)
    const postRequest = HttpClientRequest.post(`${API_URL}`)
    const putRequest = HttpClientRequest.put(`${API_URL}`)
    const getRequest = HttpClientRequest.get(`${API_URL}`)
    const patchRequest = HttpClientRequest.patch(`${API_URL}`)

    return ({
      defaultClient,
      deleteRequest,
      postRequest,
      putRequest,
      getRequest,
      patchRequest
    })
  })
}) {}

export const HttpLayer = HttpService.Default
