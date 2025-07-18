import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { pipe } from 'effect'
import * as A from 'effect/Array'
import * as O from 'effect/Option'
import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import { useSubmit } from 'react-router'
import type { Drivers } from '~/lib/models/Drivers'
import type { TripUpdate } from '~/types/api'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

const columnHelper = createColumnHelper<TripUpdate>()

export function useTripTable(loaderTrips: readonly TripUpdate[]) {
  const [trips, setTrips] = useState<TripUpdate[]>([])
  useEffect(() => {
    setTrips([...loaderTrips])
  }, [loaderTrips])

  const submit = useSubmit()

  const columns = useMemo<ColumnDef<TripUpdate>[]>(
    () => [
      {
        header: 'Trip Infos',
        footer: props => props.column.id,
        columns: [
          columnHelper.accessor('name', {
            header: () => <span>Info du trajet</span>,
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
                  onChange={e => setValue(e.target.value)}
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
              const [startDate, setStartDate] = useState<null | Date>(initialValue)

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
                  onChange={e => setValue(e.target.value)}
                  onBlur={onBlur}
                />
              )
            }
          }),
          columnHelper.accessor('drivers', {
            header: () => <span>Personnes</span>,
            footer: props => props.column.id,
            cell: ({ getValue, row: { index }, column: { id }, table }) => {
              const initialValues = getValue<TripUpdate['drivers']>()

              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [value, setValue] = useState<Drivers>([...initialValues])
              const onChange = (e: Drivers) => {
                setValue(e)

                table.options.meta?.updateData(index, id, e)
              }
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useEffect(() => {
                setValue([...initialValues])
              }, [initialValues])

              const personnes = [
                { id: 'maé' as const, name: 'Maé' },
                { id: 'charles' as const, name: 'Charles' },
                { id: 'brigitte' as const, name: 'Brigitte' }
              ]

              return (
                <div className="flex flex-col gap-2">
                  {personnes.map(personne => (
                    <div key={personne.id} className="flex items-center gap-3">
                      <Checkbox
                        disabled={value.length === 1 && personnes[0].id == personne.id}
                        checked={A.contains(personne.id)(value)}
                        onCheckedChange={checked => {
                          if (A.contains(personne.id)(value) && !checked) {
                            const personneIndex = pipe(
                              value,
                              A.findFirstIndex(v =>
                                v === personne.id
                              ),
                              O.getOrElse(() => -1)
                            )
                            const newDrivers = A.remove(personneIndex)(value)

                            onChange(newDrivers)
                            return
                          }
                          if (!A.contains(personne.id)(value) && checked) {
                            const newDrivers = A.append(personne.id)(value)
                            onChange(newDrivers)
                          }
                        }}
                      />
                      <Label htmlFor="toggle">{personne.name}</Label>
                    </div>
                  ))}
                </div>
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
          method: 'post',
          encType: 'application/json'
        })
      }
    }
  })

  return table
}
