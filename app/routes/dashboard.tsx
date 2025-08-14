import * as T from 'effect/Effect'

import { Remix } from '~/runtime/Remix'
import { TripService } from '../services/trip'

import { stringify } from 'effect/FastCheck'
import { motion } from 'motion/react'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { Unexpected } from '~/runtime/ServerResponse'

import {
  flexRender,
  type RowData
} from '@tanstack/react-table'

import { HttpServerRequest } from '@effect/platform'

import { BarChart3 } from 'lucide-react'
import { CreateTrip } from '~/components/car/AddDialog'
import { DashboardArguments } from '~/components/car/DashboardArguments'
import { StatsCard } from '~/components/car/StatsCard'
import { useTripTable } from '~/components/car/useTripTable'
import { DataTable } from '~/components/ui/data-table'
import { matchTripArgs } from '~/lib/utils'
import type { Route } from './+types/dashboard'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData,> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

export const loader = Remix.loader(
  T.gen(function* () {
    yield* T.logInfo(`Loading Dashboard...`)
    const cookieSession = yield* CookieSessionStorage

    yield* T.logDebug(`CookieSessionStorage - loader`)

    const user = yield* cookieSession.getUserName()
    const api = yield* TripService

    const userStats = yield* api.getTripStatsByUser()

    const trips = yield* api.getAllTrips()

    yield* T.logDebug(
      `Trips and stats fetched: ${stringify(trips)}, stringify(userStats)}`
    )

    return { user, trips, userStats, _tag: 'data' as const }
  }).pipe(
    // T.catchTag(
    //   'NotAuthenticated',
    //   error => new Redirect({ location: '/login', message: error.message })
    // ),
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchTag('ResponseError', error => new Unexpected({ error: error.message }))
    // T.catchAll(error => T.fail(new NotFound({ message: stringify(error) })))
  )
)

export const action = Remix.unwrapAction(
  T.succeed(
    T.gen(function* () {
      yield* T.logInfo(`Dashboard action trigged....`)

      const request = yield* HttpServerRequest.schemaBodyJson(DashboardArguments)
      return yield* matchTripArgs(request)
    }).pipe(
      T.tapError(T.logError),
      T.catchTag('RequestError', error => new Unexpected({ error: error.message }))
      // T.catchTag('ResponseError', error => new Unexpected({ error: error.message })),
      // T.catchTag('HttpBodyError', error => new Unexpected({ error: stringify(error.reason.error) }))
    )
  )
)

export default function Dashboard(
  { loaderData, actionData }: Route.ComponentProps
) {
  const trips = loaderData.trips || []
  const table = useTripTable(
    trips
  )

  return (
    <div className="relative z-10 p-4 lg:p-6">
      <div className="space-y-6 lg:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 lg:gap-4 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="min-w-[44px] min-h-[44px] lg:min-w-[48px] lg:min-h-[48px] flex items-center justify-center"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#2fd1d1] to-[#00D4AA] rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </motion.div>
            <div>
              <h1
                className="text-2xl lg:text-3xl font-bold text-black"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Tableau de bord
              </h1>
              <p
                className="text-slate-700 text-sm lg:text-base"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Vue d&apos;ensemble de l&apos;utilisation de la voiture familiale
              </p>
            </div>
          </div>
        </motion.div>
        <>
          {actionData?._tag === 'create' ?
            (
              <>
                {actionData.tripId}
              </>
            ) :
            <></>}
        </>
        {actionData?._tag === 'SimpleTaggedError' && (
          <div className="rounded-md bg-red-50  p-4">
            <div className="text-sm text-red-700 ">
              {actionData.message}
            </div>
          </div>
        )}

        {loaderData.trips && (
          <>
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Bravo !</strong>
              <span>{' '}</span>
              <span className="block sm:inline">
                Vous êtes connecté en tant que {loaderData.user}
              </span>
            </div>

            <div className="flex justify-between items-center mb-6">
              <StatsCard
                title="Ta distance totale (km)"
                value={loaderData.userStats.totalKilometers}
              />

              <CreateTrip />
            </div>
            <DataTable table={table} />
          </>
        )}
      </div>
    </div>
  )
}
