import * as T from 'effect/Effect'

import { Remix } from '~/runtime/Remix'
import { ApiService } from '../services/api'

import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'

import { stringify } from 'effect/FastCheck'
import { NotFound, Redirect } from '~/runtime/ServerResponse'

import {
  flexRender,
  type RowData
} from '@tanstack/react-table'

import { HttpServerRequest } from '@effect/platform'

import { CreateTrip } from '~/components/car/AddDialog'
import { DashboardArguments } from '~/components/car/DashboardArguments'
import { StatsCard } from '~/components/car/StatsCard'
import { useTripTable } from '~/components/car/useTripTable'
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
    const api = yield* ApiService

    const userStats = yield* api.getTripStatsByUser(user)

    const trips = yield* api.getAllTrips()

    yield* T.logDebug(
      `Trips and stats fetched: ${stringify(trips)}, stringify(userStats)}`
    )

    return { user, trips, userStats }
  }).pipe(T.catchAll(error => T.fail(new NotFound({ message: stringify(error) }))))
)

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Dashboard action trigged....`)
    const cookieSession = yield* CookieSessionStorage
    const user = yield* cookieSession.getUserName()

    const request = yield* HttpServerRequest.schemaBodyJson(DashboardArguments)
    return yield* matchTripArgs(request, user)
  }).pipe(
    T.tapError(T.logError),
    T.catchAll(() => new Redirect({ location: '/dashboard' }))
  )
)

export default function Dashboard(
  { loaderData: { user, trips, userStats } }: Route.ComponentProps
) {
  const table = useTripTable(trips)

  const totalKilometers = 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          Statistiques Globales
        </h2>

        {user && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Bravo !</strong>
            <span>{' '}</span>
            <span className="block sm:inline">
              Vous êtes connecté en tant que {user}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Ta distance totale (km)"
              value={totalKilometers}
            />
          </div>
          <CreateTrip />
        </div>
        <div className="mt-8 ">
          <div className="bg-white shadow-md rounded-lg overflow-hidden ">
            {trips.length > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th className="py-2" key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <div>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b border-gray-200">
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className={`border-r border-gray-200 p-4 ${
                            cell.column.id === 'distance' ? 'w-32' : ''
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
