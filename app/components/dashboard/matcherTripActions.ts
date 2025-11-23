import { Match, pipe } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import type { TripActions } from '~/components/dashboard/TripActions'
import { SimpleTaggedError } from '~/runtime/errors/SimpleTaggedError'
import { DistanceService } from '~/services/distance'

import { TripService } from '~/services/trip'

export const matcherTripActions = (request: TripActions) =>
  T.gen(function* () {
    yield* T.logDebug(`Trip action request: ${stringify(request)}`)
    const tripService = yield* TripService
    const distanceService = yield* DistanceService

    const userStats = yield* tripService.getTripStatsByUser()

    return yield* Match.type<TripActions>().pipe(
      Match.tag('delete', ({ tripId }) =>
        T.gen(function* () {
          yield* T.logInfo('Deleting trip...')
          yield* tripService.deleteTrip(tripId)

          yield* T.logInfo(`Trip deleted: ${stringify(tripId)}`)

          return { tripId, userStats, _tag: 'delete' as const }
        })),
      Match.tag('update', ({ tripUpdate }) =>
        T.gen(function* () {
          yield* T.logInfo(`Trip updating trip action .... ${stringify(tripUpdate)}`)

          const tripId = yield* tripService.updateTrip(tripUpdate)

          yield* T.logInfo(`Trip updated .... ${stringify(tripId)}`)

          return { tripId, userStats, _tag: 'update' as const }
        })),
      Match.tag('create', ({ tripCreate }) =>
        T.gen(function* () {
          yield* T.logInfo(`Trip creating trip action .... ${stringify(tripCreate)}`)

          const tripId = yield* tripService.createTrip(tripCreate)

          yield* T.logInfo(`Trip created .... ${stringify(tripId)}`)

          return { tripId, userStats, _tag: 'create' as const }
        })),
      Match.tag('distance', ({ from, to }) =>
        T.gen(function* () {
          yield* T.logInfo(`Calculating distance trip action .... from ${from} to ${to}`)

          const distanceResult = yield* distanceService.calculateDistance(from, to)

          const userStats = yield* tripService.getTripStatsByUser()
          return { distance: distanceResult, userStats, _tag: 'distance' as const }
        })),
      Match.tag('city', ({ city }) =>
        T.gen(function* () {
          yield* T.logInfo(`Finding cities matching .... ${city}`)

          const citiesSuggestions = yield* distanceService.findCities(city)

          return { citiesSuggestions, userStats, _tag: 'city' as const }
        })),
      Match.exhaustive
    )(request)
  }).pipe(
    T.tapError(T.logError),
    T.catchTag('ResponseError', error =>
      T.gen(function* () {
        if (error.response.status === 405) {
          return yield* pipe(
            error.response.text,
            T.tap(error => T.logError('Unauthorized Error 405', error)),
            T.flatMap(errorText =>
              T.succeed(
                SimpleTaggedError(
                  `Unauthorized Error 405  ${errorText} for url : ${error.methodAndUrl}`
                )
              )
            )
          )
        }
        return yield* T.fail(error)
      })),
    T.catchAll(error => T.succeed(SimpleTaggedError(stringify(error))))
  )
