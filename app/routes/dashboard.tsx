import * as T from 'effect/Effect'

import { Remix } from '~/runtime/Remix'
import { ApiClass2 } from '../services/api'

import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'

import { stringify } from 'effect/FastCheck'
import { NotFound } from '~/runtime/ServerResponse'

import { useEffect, useMemo, useState } from 'react'
import type { TripCreate } from '~/types/api'

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type RowData,
  useReactTable
} from '@tanstack/react-table'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
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

    yield* T.logInfo('Fetching total stats')
    const totalStats = yield* ApiClass2.getTotalStats()

    const trips = yield* ApiClass2.getAllTrips()

    return { totalStats, user, trips }
  }).pipe(T.catchAll(error => T.fail(new NotFound({ message: stringify(error) }))))
)

export default function Dashboard({ loaderData: { totalStats, user } }: Route.ComponentProps) {
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

  const [trips, setTrips] = useState<TripCreate[]>([])

  const columns = useMemo<ColumnDef<TripCreate>[]>(
    () => [
      {
        header: 'Trip Infos',
        footer: props => props.column.id,
        columns: [
          {
            accessorKey: 'name',
            header: () => <span>Name</span>,
            footer: props => props.column.id
          },
          {
            accessorKey: 'date',
            header: () => <span>Date</span>,
            footer: props => props.column.id
            // cell: ({ getValue, row, column }) => {
            //   const initialValue = getValue<Date>()
            //   // eslint-disable-next-line react-hooks/rules-of-hooks
            //   const [startDate, setStartDate] = useState<null | Date>(
            //     initialValue
            //   )
            //   return (
            //     <DatePicker
            //       selected={startDate}
            //       onChange={date => {
            //         setStartDate(date)
            //         table.options.meta?.updateData(row.index, column.id, date)
            //       }}
            //     />
            //   )
            // }
          },

          {
            accessorKey: 'distance',
            header: () => <span>Distance (km)</span>,
            footer: props => props.column.id
          },
          {
            accessorKey: 'drivers',
            header: () => <span>Personnes</span>,
            footer: props => props.column.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            cell: info => info.getValue().join(', ')
          }
        ]
      }
    ],
    []
  )

  const table = useReactTable({
    data: trips,
    columns,
    // defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),

    // Provide our updateData function to our table meta
    // meta: {
    //   updateData: (rowIndex, columnId, value) => {
    //     setTrips(old =>
    //       old.map((row, index) => {
    //         if (index === rowIndex) {
    //           return {
    //             ...old[rowIndex]!,
    //             [columnId]: value
    //           }
    //         }
    //         return row
    //       })
    //     )
    //   }
    // },
    debugTable: true
  })

  useEffect(() => {
    // Fetch trips data from API or any other source
    // For demonstration, using static data
    const fetchTrips = async () => {
      const data: TripCreate[] = [
        {
          name: 'Trip to Paris',
          date: new Date('2023-10-01'),
          distance: 300,
          drivers: ['John Doe', 'Jane Smith']
        },
        {
          name: 'Trip to Berlin',
          date: new Date('2023-10-05'),
          distance: 500,
          drivers: ['Alice Johnson']
        }
      ]
      setTrips(data)
    }

    fetchTrips()
  }, [])

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
            title="Nombre total de trajets"
            value={totalStats.trips.length}
          />
          <StatsCard
            title="Distance totale (km)"
            value={Math.round(totalStats.totalKilometers)}
          />
          <StatsCard
            title="Passagers transportés"
            value={totalStats.trips.reduce((acc, trip) => acc + trip.drivers.length, 0)}
          />
          <StatsCard
            title="Distance moyenne (km)"
            value={totalStats.trips.length === 0 ?
              0 :
              Math.round(totalStats.totalKilometers / totalStats.trips.length)}
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
