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
import { useEffect, useMemo, useState } from 'react'

import { Calendar, Edit, MapPin, Route, Trash2, User } from 'lucide-react'
import { motion } from 'motion/react'
import { useSubmit } from 'react-router'
import type { Drivers } from '~/lib/models/Drivers'
import type { TripUpdate } from '~/types/api'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import {
  Dialog,
  DialogClose,
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
        id: 'header',
        header: () => (
          <div className="flex items-center gap-3 p-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="min-w-[40px] min-h-[40px] lg:min-w-[44px] lg:min-h-[44px] flex items-center justify-center"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#2fd1d1] to-[#00D4AA] rounded-xl flex items-center justify-center">
                <Route className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
            </motion.div>
            <CardTitle
              className="text-lg lg:text-xl text-slate-900"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Historique des trajets
            </CardTitle>
          </div>
        ),
        footer: props => props.column.id,
        columns: [
          columnHelper.accessor('startDate', {
            id: 'startDate',
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
            header: () => <span>Titre</span>,
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
            header: () => <span>Distance</span>,
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
                <Badge
                  className="px-0 text-black border-0 shadow-sm text-xs lg:text-sm max-w-14 "
                  style={{
                    background: `linear-gradient(135deg, #BADE9440, #BADE9460)`,
                    fontFamily: 'Lato, sans-serif'
                  }}
                >
                  <input
                    className="py-1 w-1/2"
                    value={value}
                    onChange={e => setValue(+e.target.value)}
                    onBlur={onBlur}
                  />
                  <span>km</span>
                </Badge>
              )
            }
          }),
          columnHelper.accessor('id', {
            id: 'actions',
            header: () => <span>Actions</span>,
            cell: ({ getValue }) => (
              <div className="   ">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] text-[#002820] transition-colors duration-200 min-w-[44px] min-h-[44px] p-0 flex items-center justify-center cursor-pointer"
                  >
                    <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Dialog>
                    <DialogTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-600 text-red-900 transition-colors duration-200 min-w-[44px] min-h-[44px] p-0 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    </DialogTrigger>{' '}
                    <DialogContent className="bg-white shadow-lg" aria-describedby="delete">
                      <DialogHeader>
                        <DialogTitle className="py-2">Êtes vous sûr ?</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-end gap-4 pt-4">
                        <DialogClose>
                          <DeleteButton
                            tripId={getValue()}
                            submit={submit}
                            route={'/dashboard'}
                          />
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
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
