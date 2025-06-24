import { type ColumnDef, createColumnHelper, getCoreRowModel,
  useReactTable } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import { useSubmit } from 'react-router'
import type { TripUpdate } from '~/types/api'

const columnHelper = createColumnHelper<TripUpdate>()

export function useTripTable(loaderTrips: TripUpdate[]) {
  const [trips, setTrips] = useState<TripUpdate[]>([])
  useEffect(() => {
    setTrips(loaderTrips)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = useSubmit()

  const columns = useMemo<ColumnDef<TripUpdate>[]>(
    () => [
      {
        header: 'Trip Infos',
        footer: props => props.column.id,
        columns: [
          columnHelper.accessor('id', { header: () => <span>Id</span> }),
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
              const initialValue = getValue<TripUpdate['drivers']>().join(', ')
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

  return table
}
