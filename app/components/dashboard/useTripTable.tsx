import DatePicker from 'react-datepicker'

import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { pipe } from 'effect'
import * as A from 'effect/Array'
import * as O from 'effect/Option'
import { Calendar, MapPin, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Drivers } from '~/lib/models/Drivers'
import type { TripUpdate } from '~/types/api'
import { TableEditAndDelete } from '../buttons/TableEditAndDelete'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { useIsMobile } from '../ui/use-mobile'
import { TaggedUpdateTrip } from './TripActions'

const columnHelper = createColumnHelper<TripUpdate>()

export function useTripTable(
  loaderTrips: readonly TripUpdate[],
  setTripUpdate: (tripUpdate: TripUpdate | undefined) => void
) {
  const isMobile = useIsMobile()
  const [trips, setTrips] = useState<TripUpdate[]>([])
  useEffect(() => {
    setTrips([...loaderTrips])
  }, [loaderTrips])

  const columns = useMemo<ColumnDef<TripUpdate>[]>(
    () => [
      {
        id: 'header',
        footer: props => props.column.id,
        columns: [
          columnHelper.accessor('startDate', {
            id: 'startDate',
            header: () => (
              <span
                className="text-left sm:p-4 p-1 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Début' : 'Date de début'}
              </span>
            ),
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValue = getValue<Date>()
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [startDate, setStartDate] = useState<null | Date>(initialValue)

              // eslint-disable-next-line react-hooks/rules-of-hooks
              useEffect(() => {
                setStartDate(initialValue)
              }, [initialValue])
              return (
                <div
                  className="font-medium text-slate-900 flex items-center gap-1 text-xs sm:text-sm lg:text-base w-18 sm:w-full"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {isMobile ? null : <Calendar className="h-3 w-3 text-slate-500 flex-shrink-0" />}
                  <DatePicker
                    dateFormat={isMobile ? 'dd/M/yy' : 'dd/MM/yyyy'}
                    className="sm:p-2 sm:w-full w-18"
                    selected={startDate}
                    onChange={date => {
                      setStartDate(date)
                      table.options.meta?.updateData(index, id, date)
                    }}
                  />
                </div>
              )
            }
          }),
          columnHelper.accessor('endDate', {
            id: 'endDate',
            header: () => (
              <span
                className="text-left sm:p-4 p-1 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Fin' : ' Date de fin'}
              </span>
            ),
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValue = getValue<Date>()
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [startDate, setStartDate] = useState<null | Date>(initialValue)

              // eslint-disable-next-line react-hooks/rules-of-hooks
              useEffect(() => {
                setStartDate(initialValue)
              }, [initialValue])
              return (
                <div
                  className="font-medium text-slate-900 flex items-center gap-1 text-xs sm:text-sm lg:text-base"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {isMobile ? null : <Calendar className="h-3 w-3 text-slate-500 flex-shrink-0" />}
                  <DatePicker
                    dateFormat={isMobile ? 'dd/M/yy' : 'dd/MM/yyyy'}
                    className="sm:p-2 sm:w-full w-24 "
                    selected={startDate}
                    onChange={date => {
                      setStartDate(date)
                      table.options.meta?.updateData(index, id, date)
                    }}
                  />
                </div>
              )
            }
          }),

          columnHelper.accessor('drivers', {
            id: 'drivers',
            header: () => (
              <span
                className="text-left sm:p-4 p-1 text-[#004D55]  font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Qui' : 'Conducteurs'}
              </span>
            ),
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValues = getValue<TripUpdate['drivers']>()

              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [drivers, setDrivers] = useState<Drivers>([...initialValues])
              const onChange = (e: Drivers) => {
                setDrivers(e)

                table.options.meta?.updateData(index, id, e)
              }
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useEffect(() => {
                setDrivers([...initialValues])
              }, [initialValues])

              const personnes = [
                { id: 'maé' as const, name: 'Maé' },
                { id: 'charles' as const, name: 'Charles' },
                { id: 'brigitte' as const, name: 'Brigitte' }
              ]

              return (
                <div className="flex flex-col sm:gap-2 gap-1 py-1 sm:min-w-[200px]  cursor-pointer">
                  {personnes.map(personne => (
                    <Badge
                      key={personne.id}
                      className="text-white border-0 shadow-sm text-xs lg:text-sm px-2 py-1  "
                      style={{
                        background: `linear-gradient(135deg,#55C3E9CC, #55C3E9)`,
                        fontFamily: 'Lato, sans-serif'
                      }}
                    >
                      <Checkbox
                        className="cursor-pointer "
                        disabled={drivers.length === 1 && drivers[0] == personne.id}
                        checked={A.contains(personne.id)(drivers)}
                        onCheckedChange={checked => {
                          if (A.contains(personne.id)(drivers) && !checked) {
                            const personneIndex = pipe(
                              drivers,
                              A.findFirstIndex(v => v === personne.id),
                              O.getOrElse(() =>
                                -1
                              )
                            )
                            const newDrivers = A.remove(personneIndex)(drivers)

                            onChange(newDrivers)
                            return
                          }
                          if (!A.contains(personne.id)(drivers) && checked) {
                            const newDrivers = A.append(personne.id)(drivers)
                            onChange(newDrivers)
                          }
                        }}
                      />
                      <Label htmlFor="toggle " className="text-xs sm:text-sm">
                        {personne.name}
                      </Label>
                      {isMobile ? null : <User className="h-3 w-3 mr-1 flex-shrink-0 " />}
                    </Badge>
                  ))}
                </div>
              )
            }
          }),
          columnHelper.accessor('name', {
            id: 'name',
            header: () => (
              <span
                className="text-left sm:p-4 p-1 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Titre
              </span>
            ),
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
                <div
                  className="font-medium text-slate-900 flex items-center text-xs sm:text-sm lg:text-base p-1"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {isMobile ? null : <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />}
                  <input
                    className=" sm:p-2 w-full truncate"
                    value={value as string}
                    onChange={e => setValue(e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
              )
            }
          }),
          columnHelper.accessor('distance', {
            id: 'distance',
            header: () => (
              <span
                className="text-left sm:p-4 p-1 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Km' : 'Distance'}
              </span>
            ),
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValue = getValue<number>()
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
                <span
                  className="text-xs sm:text-sm font-medium text-gray-900 font-body"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <input
                    className="py-1 w-1/3 bg-amber-50 min-w-8"
                    value={value}
                    onChange={e => setValue(+e.target.value)}
                    onBlur={onBlur}
                  />
                  {isMobile ? null : <span>km</span>}
                </span>
              )
            }
          }),
          columnHelper.accessor('id', {
            id: 'actions',
            header: () => (
              <span
                className="text-left sm:p-4 p-1 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Actions
              </span>
            ),
            cell: ({ getValue, row }) => (
              <TableEditAndDelete
                data={row.original}
                getValue={getValue}
                setDataUpdate={setTripUpdate}
              />
            )
          })
        ]
      }
    ],
    [isMobile, setTripUpdate]
  )

  const table = useReactTable({
    data: trips,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: async (rowIndex, columnId, value) => {
        const updatedTrip = { ...trips[rowIndex], [columnId]: value }

        setTrips(old => old.map((row, index) => (index === rowIndex ? updatedTrip : row)))
        const taggedUpdatedTrip = TaggedUpdateTrip.make({
          tripUpdate: updatedTrip
        })
        // @ts-expect-error date is a string
        submit(taggedUpdatedTrip, {
          action: '/dashboard',
          method: 'post',
          encType: 'application/json'
        })
      }
    }
  })

  return table
}
