import { HttpBody, HttpClient, HttpClientRequest } from '@effect/platform'
import { Config, Context, pipe, Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import * as O from 'effect/Option'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { type Trip, type TripStats, TripUpdate } from '../types/api'
import { TripCreate } from '../types/api'

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
    const API_URL = yield* pipe(
      Config.string('API_URL'),
      Config.withDefault('http://localhost:8081/api')
    )
    const login = (login: string) =>
      T.gen(function* () {
        yield* T.logInfo(`login url : ${API_URL}/login`)
        const loginUrl = HttpClientRequest.post(`${API_URL}/login`)

        const body = yield* HttpBody.json({ name: login })
        const loginRequest = pipe(
          loginUrl,
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(loginRequest)
        yield* T.logInfo('login http response :', response)
        const responseJson = yield* response.json

        if (response.status === 401) {
          yield* T.logInfo(response.status === 401)
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
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
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
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
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

    const getTotalStats = () =>
      T.gen(function* () {
        yield* T.logInfo(`Getting trips....`)
        const httpClient = HttpClientRequest.get(`${API_URL}/trips/total`)

        const response = yield* defaultClient.execute(httpClient)
        const responseJson = yield* response.json
        return responseJson as TripStats
      })

    const getAllTrips = () =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logInfo(`Getting token....`)
        const token = yield* cookieSession.getUserToken()
        yield* T.logInfo(`Found token....`, token)
        const httpClient = HttpClientRequest.get(`${API_URL}/trips`)
        const getAllTripsRequest = pipe(
          httpClient,
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`)
        )
        const response = yield* defaultClient.execute(getAllTripsRequest)

        const responseJson = yield* response.json

        return responseJson as { trips: TripUpdate[]; totalKilometers: number }
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
      getTotalStats,
      getAllTrips,
      createChat,
      addMessageToChat
    })
  })
}) {}

export const ApiLayer = ApiService.Default

const API_URL = 'TO DELETE'

export const api = {
  login(login: string) {
    return T.gen(function* () {
      const defaultClient = yield* HttpClient.HttpClient
      const toto = HttpClientRequest.get(`${API_URL}/login`)

      const body = yield* HttpBody.json({ name: login })
      const loginRequest = pipe(
        toto,
        HttpClientRequest.setHeader('Content-Type', 'application/json'),
        HttpClientRequest.setBody(body),
        HttpClientRequest.setMethod('POST')
      )

      const response = yield* defaultClient.execute(loginRequest)
      yield* T.logInfo(response)
      const responseJson = yield* response.json

      if (response.status === 401) {
        yield* T.logInfo(response.status === 401)
        return yield* T.fail(stringify(responseJson))
      }

      return responseJson as { token: string }
    }).pipe(
      T.scoped
    )
  },

  async createTrip(trip: TripCreate, token: string): Promise<Trip> {
    const response = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(trip)
    })
    return handleResponse<Trip>(response)
  },

  async getUserStats(token: string): Promise<TripStats> {
    const response = await fetch(`${API_URL}/trips/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return handleResponse<TripStats>(response)
  },

  getTotalStats() {
    return T.gen(function* () {
      const defaultClient = yield* HttpClient.HttpClient
      const toto = HttpClientRequest.get(`${API_URL}/trips/total`)

      const response = yield* defaultClient.execute(toto)
      const responseJson = yield* response.json
      return responseJson as TripStats
    }).pipe(
      T.scoped
    )
  }
}
