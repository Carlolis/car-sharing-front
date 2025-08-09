import { HttpBody, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'

import type { HttpClientError } from '@effect/platform/HttpClientError'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { TripCreate, TripStats, TripUpdate } from '../types/api'
import { HttpService } from './httpClient'

export class TripService extends T.Service<TripService>()('TripService', {
  effect: T.gen(function* () {
    const { defaultClient, deleteRequest, postRequest, putRequest, getRequest } = yield* HttpService

    const deleteTrip = (tripId: string) =>
      T.gen(function* () {
        const deleteUrl = pipe(deleteRequest, HttpClientRequest.appendUrl(`/trips/${tripId}`))
        const response = yield* defaultClient.execute(deleteUrl)
        yield* T.logInfo('TripService deleteTrip response :', response)

        return response.status
      }).pipe(
        T.tapError(T.logError),
        T.annotateLogs(TripService.name, deleteTrip.name)
      )

    const createTrip = (trip: TripCreate) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()
        yield* T.logDebug(`Token ?.... ${stringify(token)}`)
        const loginUrl = pipe(postRequest, HttpClientRequest.appendUrl('/trips'))

        const body = yield* HttpBody.jsonSchema(TripCreate)({ ...trip })
        const createTrip = pipe(
          loginUrl,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(createTrip)

        if (response.status === 401 || response.status === 400) {
          const error = yield* response.text
          yield* T.logDebug('Unauthorized Error', error)
          yield* T.logDebug('Error status :', response.status)
        }

        return yield* HttpClientResponse.schemaBodyJson(Sc.String)(response)
      }).pipe(
        T.tapError(T.logError),
        T.annotateLogs(TripService.name, createTrip.name)
      )

    const updateTrip = (trip: TripUpdate) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()

        const body = yield* HttpBody.jsonSchema(TripUpdate)(trip)
        const updateTrip = pipe(
          putRequest,
          HttpClientRequest.appendUrl(`/trips/${trip.id}`),
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.setBody(body)
        )
        yield* T.logDebug(`About to update a trip.... ${stringify(trip)}`)
        const response = yield* defaultClient.execute(updateTrip)
        yield* T.logDebug(`Response status : ${response.status}`)
        if (response.status === 401 || response.status === 400) {
          const error = yield* response.text
          yield* T.logError('Unauthorized Error', error)
          yield* T.logError('Error status :', response.status)
        }

        return yield* HttpClientResponse.schemaBodyJson(Sc.String)(response)
      }).pipe(
        T.tapError(T.logError),
        T.annotateLogs(TripService.name, updateTrip.name)
      )

    const getTripStatsByUser: (username: string) => T.Effect<TripStats, HttpClientError, never> = (
      username: string
    ) =>
      T.gen(function* () {
        yield* T.logDebug(`Getting stats for user.... ${username}`)

        const getTripStatsByUser = pipe(
          getRequest,
          HttpClientRequest.appendUrl(`/trips/total`),
          HttpClientRequest.setUrlParam('username', username)
        )

        const response = yield* defaultClient.execute(getTripStatsByUser)
        yield* T.logDebug(`Stats for user.... ${username}`)

        return yield* pipe(
          response,
          HttpClientResponse.schemaBodyJson(TripStats),
          T.tapError(T.logError),
          T.catchAll(() => T.succeed(TripStats.make({ totalKilometers: 0 })))
        )
      }).pipe(
        T.tapError(T.logError),
        T.annotateLogs('Trip', getTripStatsByUser.name)
      )

    const getAllTrips = () =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()
        yield* T.logDebug(`Found token....`, token)

        const getAllTripsRequest = pipe(
          getRequest,
          HttpClientRequest.appendUrl('/trips'),
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`)
        )
        const response = yield* defaultClient.execute(getAllTripsRequest)

        const responseJson = yield* pipe(
          HttpClientResponse.schemaBodyJson(Sc.Array(TripUpdate))(response),
          T.tapError(T.logError),
          T.catchAll(() => T.succeed<readonly TripUpdate[]>([]))
        )

        yield* T.logDebug(`Found ${stringify(responseJson.length)} trips`)

        return responseJson
      }).pipe(
        T.tapError(T.logError),
        T.annotateLogs(TripService.name, getAllTrips.name)
      )

    return ({
      updateTrip,
      createTrip,
      getTripStatsByUser,
      getAllTrips,
      deleteTrip
    })
  })
}) {}

export const TripLayer = TripService.Default
