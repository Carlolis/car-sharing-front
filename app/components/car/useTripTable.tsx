import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { pipe } from 'effect'
import * as A from 'effect/Array'
import * as O from 'effect/Option'
import { Fragment, useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import { useSubmit } from 'react-router'
import type { Drivers } from '~/lib/models/Drivers'
import type { TripUpdate } from '~/types/api'
import { Checkbox } from '../ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Label } from '../ui/label'
import { TaggedUpdateTrip } from './DashboardArguments'
import { DeleteButton } from './DeleteButton'

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
                  className=" p-2 w-full"
                  value={value as string}
                  onChange={e => setValue(e.target.value)}
                  onBlur={onBlur}
                />
              )
            }
          }),
          columnHelper.accessor('startDate', {
            header: () => <span>Date de début</span>,
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
                  className=" p-2 w-full"
                  selected={startDate}
                  onChange={date => {
                    setStartDate(date)
                    table.options.meta?.updateData(index, id, date)
                  }}
                />
              )
            }
          }),
          columnHelper.accessor('endDate', {
            header: () => <span>Date de fin</span>,
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
                  className=" p-2 w-full"
                  locale={'fr'}
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
                <input
                  className=" p-2 w-full"
                  value={value}
                  onChange={e => setValue(+e.target.value)}
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
                <div className="flex flex-col gap-2 p-2 w-full">
                  {personnes.map(personne => (
                    <div key={personne.id} className="flex items-center gap-3">
                      <Checkbox
                        disabled={drivers.length === 1 && drivers[0] == personne.id}
                        checked={A.contains(personne.id)(drivers)}
                        onCheckedChange={checked => {
                          if (A.contains(personne.id)(drivers) && !checked) {
                            const personneIndex = pipe(
                              drivers,
                              A.findFirstIndex(v =>
                                v === personne.id
                              ),
                              O.getOrElse(() => -1)
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
                      <Label htmlFor="toggle">{personne.name}</Label>
                    </div>
                  ))}
                </div>
              )
            }
          }),
          columnHelper.display({
            id: 'actions',
            header: () => <span>Supprimer</span>,
            cell: ({ row }) => (
              <Fragment>
                <Dialog>
                  <DialogTrigger>
                    <DeleteButton />
                  </DialogTrigger>
                  <DialogContent className="bg-white shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="py-2">Êtes vous sûr ?</DialogTitle>
                      <DeleteButton row={row} />
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </Fragment>
            )
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
