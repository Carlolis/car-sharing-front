import * as T from 'effect/Effect'

import { Remix } from '~/runtime/Remix'
import { ApiService } from '../services/api'

import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'

import { stringify } from 'effect/FastCheck'
import { NotFound, Redirect } from '~/runtime/ServerResponse'

import { useEffect, useMemo, useState } from 'react'
import type { TripCreate } from '~/types/api'
import { TripUpdate } from '~/types/api'

import {
  type ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type RowData,
  useReactTable
} from '@tanstack/react-table'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import { HttpServerRequest } from '@effect/platform'
import { useLoaderData, useSubmit } from 'react-router'
import type { Route } from './+types/dashboard'

function StatsCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
      </div>
    </div>
  )
}
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData,> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

export const loader = Remix.loader(
  T.gen(function* () {
    const cookieSession = yield* CookieSessionStorage
    const user = yield* cookieSession.getUserName()
    const api = yield* ApiService
    yield* T.logInfo('Fetching total stats')
    const totalStats = yield* api.getTotalStats()

    const trips = yield* api.getAllTrips()

    // Return the data as an object
    return { totalStats, user, trips }
  }).pipe(T.catchAll(error => T.fail(new NotFound({ message: stringify(error) }))))
)

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Updating Trip....`)

    const api = yield* ApiService

    const tripUpdate = yield* HttpServerRequest.schemaBodyForm(
      TripUpdate
    )

    const tripId = yield* api.updateTrip(tripUpdate)
    yield* T.logInfo(`Trip updated .... ${stringify(tripId)}`)
    return { tripId }
  }).pipe(
    T.tapError(T.logError),
    T.catchAll(() => new Redirect({ location: '/dashboard' }))
  )
)

export default function Dashboard(
  { loaderData: { totalStats, user, trips: loaderTrips } }: Route.ComponentProps
) {
  // Give our default column cell renderer editing superpowers!
  // const defaultColumn: Partial<ColumnDef<TripCreate>> = {
  //   cell: ({ getValue, row: { index }, column: { id }, table }) => {
  //     const initialValue = getValue()
  //     // We need to keep and update the state of the cell normally
  //     // eslint-disable-next-line react-hooks/rules-of-hooks
  //     const [value, setValue] = useState(initialValue)

  //     // When the input is blurred, we'll call our table meta's updateData function
  //     const onBlur = () => {
  //       table.options.meta?.updateData(index, id, value)
  //     }

  //     // If the initialValue is changed external, sync it up with our state
  //     // eslint-disable-next-line react-hooks/rules-of-hooks
  //     useEffect(() => {
  //       setValue(initialValue)
  //     }, [initialValue])

  //     return (
  //       <input
  //         value={value as string}
  //         onChange={e => setValue(e.target.value)}
  //         onBlur={onBlur}
  //       />
  //     )
  //   }
  // }

  const submit = useSubmit()

  const [trips, setTrips] = useState<TripCreate[]>([])
  const columnHelper = createColumnHelper<TripCreate>()
  const columns = useMemo<ColumnDef<TripCreate>[]>(
    () => [
      {
        header: 'Trip Infos',
        footer: props => props.column.id,
        columns: [
          columnHelper.accessor('name', {
            header: () => <span>Nom</span>,
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValue = getValue()
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [value, setValue] = useState(initialValue)
              const onBlur = () => {
                table.options.meta?.updateData(index, id, value)
              }
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useEffect(() => {
                setValue(initialValue)
              }, [initialValue])

              return (
                <input
                  value={value as string}
                  onChange={e => {
                    setValue(e.target.value)
                  }}
                  onBlur={onBlur}
                />
              )
            }
          }),

          columnHelper.accessor('date', {
            header: () => <span>Date</span>,
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValue = getValue<Date>()
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [startDate, setStartDate] = useState<null | Date>(
                initialValue
              )

              // eslint-disable-next-line react-hooks/rules-of-hooks
              useEffect(() => {
                setStartDate(initialValue)
              }, [initialValue])
              return (
                <DatePicker
                  selected={startDate}
                  onChange={date => {
                    setStartDate(date)
                    table.options.meta?.updateData(index, id, date)
                  }}
                />
              )
            }
          }),

          columnHelper.accessor('distance', {
            header: () => <span>Distance (km)</span>,
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValue = getValue()
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [value, setValue] = useState(initialValue)

              const onBlur = () => {
                table.options.meta?.updateData(index, id, value)
              }
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useEffect(() => {
                setValue(initialValue)
              }, [initialValue])

              return (
                <input
                  value={value as string}
                  onChange={e => {
                    setValue(e.target.value)
                  }}
                  onBlur={onBlur}
                />
              )
            }
          }),
          columnHelper.accessor('drivers', {
            header: () => <span>Personnes</span>,
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValue = getValue<TripCreate['drivers']>().join(', ')
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [value, setValue] = useState(initialValue)

              const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                setValue(e.target.value)
                table.options.meta?.updateData(index, id, e.target.value.split(', '))
              }

              // eslint-disable-next-line react-hooks/rules-of-hooks
              useEffect(() => {
                setValue(initialValue)
              }, [initialValue])

              return (
                <select value={value} onChange={onChange} className="w-full">
                  <option value="maé">maé</option>
                  <option value="charles">charles</option>
                  <option value="brigitte">brigitte</option>
                </select>
              )
            }
          })
        ]
      }
    ],
    []
  )

  const table = useReactTable({
    data: trips,
    columns,
    getCoreRowModel: getCoreRowModel(),

    meta: {
      updateData: async (rowIndex, columnId, value) => {
        const updatedTrip = { ...trips[rowIndex], [columnId]: value }

        setTrips(old => old.map((row, index) => (index === rowIndex ? updatedTrip : row)))

        // @ts-expect-error date is a string
        submit(updatedTrip, {
          action: '/dashboard',
          method: 'post'
        })
      }
    },
    debugTable: true
  })

  useEffect(() => {
    const fetchTrips = async () => {
      setTrips(loaderTrips.trips)
    }

    fetchTrips()
  }, [loaderTrips])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          Statistiques Globales
        </h2>
        <DatePicker />
        {user && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Connecté !</strong>
            <span>{' '}</span>
            <span className="block sm:inline">
              Vous êtes connecté en tant que {user}
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Distance totale (km)"
            value={Math.round(totalStats.totalKilometers)}
          />
        </div>
        <div className="mt-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {trips.length > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} colSpan={header.colSpan}>
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
