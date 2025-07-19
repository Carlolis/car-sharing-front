import { HttpBody, HttpClient, HttpClientRequest } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import * as O from 'effect/Option'
import { Config } from '~/runtime/Config'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { type Trip, TripCreate, TripStats, TripUpdate } from '../types/api'

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

async function handleResponse<T,>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.clone().json()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    throw new ApiError(response.status, error.message)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.clone().json()
}

export class ApiService extends T.Service<ApiService>()('ApiService', {
  effect: T.gen(function* () {
    const defaultClient = yield* HttpClient.HttpClient
    const API_URL = yield* pipe(Config, T.flatMap(c => c.getConfig), T.map(c => c.API_URL))
    const login = (login: string) =>
      T.gen(function* () {
        yield* T.logInfo(`ApiService login url : ${API_URL}/login`)
        const loginUrl = HttpClientRequest.post(`${API_URL}/login`)

        const body = yield* HttpBody.json({ name: login })
        const loginRequest = pipe(
          loginUrl,
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(loginRequest)
        yield* T.logInfo('ApiService login http response :', response)
        const responseJson = yield* response.json
        yield* T.logInfo('ApiService login json response :', response)
        if (response.status !== 200) {
          yield* T.logError('ApiService login response status is', response.status)
          return yield* T.fail(stringify(responseJson))
        }

        return responseJson as { token: string }
      }).pipe(
        T.annotateLogs('Api', 'login')
      )

    const createTrip = (trip: TripCreate) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logInfo(`Getting token....`)
        const token = yield* cookieSession.getUserToken()
        yield* T.logInfo(`Token ?.... ${stringify(token)}`)
        const loginUrl = HttpClientRequest.post(`${API_URL}/trips`)

        const body = yield* HttpBody.jsonSchema(TripCreate)({ ...trip, drivers: ['maé'] })
        const createTrip = pipe(
          loginUrl,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(createTrip)

        if (response.status === 401 || response.status === 400) {
          const error = yield* response.text
          yield* T.logInfo('Unauthorized Error', error)
          yield* T.logInfo('Error status :', response.status)
        }

        const responseJson = yield* response.json

        return Sc.decodeUnknownSync(Sc.String)(responseJson)
      }).pipe(
        T.annotateLogs('Api', 'createTrip')
      )

    const updateTrip = (trip: TripUpdate) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logInfo(`Getting token....`)
        const token = yield* cookieSession.getUserToken()

        const loginUrl = HttpClientRequest.put(`${API_URL}/trips`)

        const body = yield* HttpBody.jsonSchema(TripUpdate)(trip)
        const updateTrip = pipe(
          loginUrl,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.setBody(body)
        )
        yield* T.logInfo(`About to update a trip.... ${stringify(trip)}`)
        const response = yield* defaultClient.execute(updateTrip)
        yield* T.logInfo(`Response status : ${response.status}`)
        if (response.status === 401 || response.status === 400) {
          const error = yield* response.text
          yield* T.logInfo('Unauthorized Error', error)
          yield* T.logInfo('Error status :', response.status)
        }

        const responseJson = yield* response.json

        return Sc.decodeUnknownSync(Sc.String)(responseJson)
      }).pipe(
        T.annotateLogs('Api', 'updateTrip')
      )

    const getTripStatsByUser = (username: string) =>
      T.gen(function* () {
        yield* T.logDebug(`Getting stats for user.... ${username}`)

        const httpClient = pipe(
          `${API_URL}/trips/total`,
          HttpClientRequest.get,
          HttpClientRequest.setUrlParam('username', username)
        )

        const response = yield* defaultClient.execute(httpClient)

        const responseJson = yield* pipe(
          response.json,
          T.flatMap(Sc.decodeUnknown(TripStats)),
          T.tapError(T.logError),
          T.catchAll(() => T.succeed(TripStats.make({ totalKilometers: 0 })))
        )
        return responseJson
      })

    const getAllTrips = () =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()
        yield* T.logDebug(`Found token....`, token)
        const httpClient = HttpClientRequest.get(`${API_URL}/trips`)
        const getAllTripsRequest = pipe(
          httpClient,
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`)
        )
        const response = yield* defaultClient.execute(getAllTripsRequest)

        const responseJson = yield* pipe(
          response.json,
          T.flatMap(Sc.decodeUnknown(Sc.Array(TripUpdate))),
          T.tapError(T.logError),
          T.catchAll(() => T.succeed<readonly TripUpdate[]>([]))
        )

        yield* T.logDebug(`Found trips.... ${stringify(responseJson)}`)

        return responseJson
      })

    pipe(O.some('token'), O.map(toke => O.some(toke + '1')))

    const createChat = (writerId: string, name: string) =>
      T.gen(function* () {
        const httpClient = HttpClientRequest.post(`${API_URL}/ia/createChat`)
        const body = yield* HttpBody.json({ writerId, name })
        const createChatRequest = pipe(
          httpClient,
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(createChatRequest)
        const responseJson = yield* response.json
        yield* T.logInfo('responseJson', responseJson)
        return responseJson as string
      })

    const addMessageToChat = (chatUuid: string, message: { question: string; answer: string }) =>
      T.gen(function* () {
        const httpClient = HttpClientRequest.post(`${API_URL}/ia/addMessage`)
        const body = yield* HttpBody.json({ chatUuid, message })
        const createChatRequest = pipe(
          httpClient,
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setBody(body)
        )
        const response = yield* defaultClient.execute(createChatRequest)
        const responseJson = yield* response.json
        yield* T.logInfo('responseJson', responseJson)
        return responseJson as string
      })

    return ({
      updateTrip,
      login,
      createTrip,
      getTripStatsByUser,
      getAllTrips,
      createChat,
      addMessageToChat
    })
  })
}) {}

export const ApiLayer = ApiService.Default
