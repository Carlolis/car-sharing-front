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
import { Calendar, Edit3, MapPin, Trash2, User } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { useSubmit } from 'react-router'
import type { Drivers } from '~/lib/models/Drivers'
import type { TripUpdate } from '~/types/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { TaggedUpdateTrip } from './DashboardArguments'
import { DeleteButton } from './DeleteButton'

const columnHelper = createColumnHelper<TripUpdate>()

export function useTripTable(
  loaderTrips: readonly TripUpdate[],
  setTripUpdate: (tripUpdate: TripUpdate | undefined) => void
) {
  const [trips, setTrips] = useState<TripUpdate[]>([])
  useEffect(() => {
    setTrips([...loaderTrips])
  }, [loaderTrips])

  const submit = useSubmit()

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
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Date de début
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
                  className="font-medium text-slate-900 flex items-center gap-1 text-sm lg:text-base"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Calendar className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <DatePicker
                    dateFormat={'dd/MM/yyyy'}
                    className="p-2 w-full"
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
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Date de fin
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
                  className="font-medium text-slate-900 flex items-center gap-1 text-sm lg:text-base"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Calendar className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <DatePicker
                    dateFormat={'dd/MM/yyyy'}
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
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Personnes
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
                <div className="flex flex-col gap-2 py-1 min-w-[200px] cursor-pointer">
                  {personnes.map(personne => (
                    <Badge
                      key={personne.id}
                      className="text-white border-0 shadow-sm text-xs lg:text-sm px-2 py-1 "
                      style={{
                        background: `linear-gradient(135deg,#55C3E9CC, #55C3E9)`,
                        fontFamily: 'Lato, sans-serif'
                      }}
                    >
                      <Checkbox
                        className="cursor-pointer"
                        disabled={drivers.length === 1 && drivers[0] == personne.id}
                        checked={A.contains(personne.id)(drivers)}
                        onCheckedChange={checked => {
                          if (A.contains(personne.id)(drivers) && !checked) {
                            const personneIndex = pipe(
                              drivers,
                              A.findFirstIndex(v => v === personne.id),
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
                      <User className="h-3 w-3 mr-1 flex-shrink-0" />
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
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
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
                  className="font-medium text-slate-900 flex items-center gap-1 text-sm lg:text-base"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <input
                    className=" p-2 w-full"
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
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Distance
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
                  className="text-sm font-medium text-gray-900 font-body"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <input
                    className="py-1 w-1/3 bg-amber-50 "
                    value={value}
                    onChange={e => setValue(+e.target.value)}
                    onBlur={onBlur}
                  />
                  <span>km</span>
                </span>
              )
            }
          }),
          columnHelper.accessor('id', {
            id: 'actions',
            header: () => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Actions
              </span>
            ),
            cell: ({ getValue, row }) => (
              <div className="   ">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTripUpdate(row.original)
                    }}
                    className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-gray-200 shadow-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle
                          className="text-lg text-[#004D55] font-heading"
                          style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
                        >
                          Confirmer la suppression
                        </AlertDialogTitle>
                        <AlertDialogDescription
                          className="text-[#6B7280] font-body"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Est-ce que tu es sûr de supprimer ce trajet ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel
                          className="border-gray-300 text-[#004D55] hover:bg-gray-50 font-body"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Non
                        </AlertDialogCancel>
                        <AlertDialogAction
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <DeleteButton
                            tripId={getValue()}
                            submit={submit}
                            route={'/dashboard'}
                          />
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              </div>
            )
          })
        ]
      }
    ],
    [submit]
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
