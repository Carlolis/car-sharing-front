import { type ClassValue, clsx } from 'clsx'
import { Match, pipe } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { twMerge } from 'tailwind-merge'
import type { DashboardArguments } from '~/components/dashboard/DashboardArguments'
import { SimpleTaggedError } from '~/runtime/errors/SimpleTaggedError'

import { TripService } from '~/services/trip'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const matchTripArgs = (request: DashboardArguments) =>
  T.gen(function* () {
    yield* T.logDebug(`Trip action request: ${stringify(request)}`)
    const api = yield* TripService
    return yield* Match.type<DashboardArguments>().pipe(
      Match.tag('delete', ({ tripId }) =>
        T.gen(function* () {
          yield* T.logInfo('Deleting trip...')
          yield* api.deleteTrip(tripId)

          yield* T.logInfo(`Trip deleted: ${stringify(tripId)}`)

          const userStats = yield* api.getTripStatsByUser()
          return { tripId, userStats, _tag: 'delete' as const }
        })),
      Match.tag('update', ({ tripUpdate }) =>
        T.gen(function* () {
          yield* T.logInfo(`Trip updating trip action .... ${stringify(tripUpdate)}`)

          const tripId = yield* api.updateTrip(tripUpdate)

          yield* T.logInfo(`Trip updated .... ${stringify(tripId)}`)
          const userStats = yield* api.getTripStatsByUser()
          return { tripId, userStats, _tag: 'update' as const }
        })),
      Match.tag('create', ({ tripCreate }) =>
        T.gen(function* () {
          yield* T.logInfo(`Trip creating trip action .... ${stringify(tripCreate)}`)

          const tripId = yield* api.createTrip(tripCreate)

          yield* T.logInfo(`Trip created .... ${stringify(tripId)}`)
          const userStats = yield* api.getTripStatsByUser()
          return { tripId, userStats, _tag: 'create' as const }
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
