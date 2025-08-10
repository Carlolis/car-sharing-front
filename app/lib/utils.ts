import { type ClassValue, clsx } from 'clsx'
import { Match } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { twMerge } from 'tailwind-merge'
import type { DashboardArguments } from '~/components/car/DashboardArguments'

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
    T.tapError(T.logError)
    // T.catchAll(error => T.succeed(SimpleTaggedError(error.toString())))
  )
