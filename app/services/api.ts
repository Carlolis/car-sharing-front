import { HttpBody, HttpClient, HttpClientRequest } from '@effect/platform'
import { Context, pipe, Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import type { Trip, TripStats } from '../types/api'
import { TripCreate } from '../types/api'

const API_URL = 'http://localhost:8080/api'

export class ApiError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

async function handleResponse<T,>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.clone().json()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new ApiError(response.status, error.message)
  }
  return response.clone().json()
}

export class ApiService extends T.Service<ApiService>()('ApiService', {
  effect: T.gen(function* () {
    const defaultClient = yield* HttpClient.HttpClient

    const login = (login: string) => {
      return T.gen(function* () {
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
          yield* T.fail(stringify(responseJson))
        }

        return responseJson as { token: string }
      })
    }

    const createTrip = (token: string) =>
      (trip: TripCreate) => {
        return T.gen(function* () {
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
        })
      }

    const getTotalStats = () => {
      return T.gen(function* () {
        const defaultClient = yield* HttpClient.HttpClient
        const toto = HttpClientRequest.get(`${API_URL}/trips/total`)

        const response = yield* defaultClient.execute(toto)
        const responseJson = yield* response.json
        return responseJson as TripStats
      })
    }

    const getAllTrips = () => []
    return ({
      login,
      createTrip,
      getTotalStats,
      getAllTrips
    })
  })
}) {}

export class ApiClass2 extends T.Tag('ApiService')<ApiService, ApiService>() {}

export class Api extends Context.Tag('ApiService')<
  ApiService,
  ApiService
>() {
}

export const ApiLayer = ApiService.Default

export const api = {
  login(login: string) {
    return T.gen(function* () {
      const defaultClient = yield* HttpClient.HttpClient
      const toto = HttpClientRequest.get(`${API_URL}/login`)

      const body = yield* HttpBody.json({ name: login })
      const titi = pipe(
        toto,
        HttpClientRequest.setHeader('Content-Type', 'application/json'),
        HttpClientRequest.setBody(body),
        HttpClientRequest.setMethod('POST')
      )

      const response = yield* defaultClient.execute(titi)
      yield* T.logInfo(response)
      const responseJson = yield* response.json

      if (response.status === 401) {
        yield* T.logInfo(response.status === 401)
        yield* T.fail(stringify(responseJson))
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
