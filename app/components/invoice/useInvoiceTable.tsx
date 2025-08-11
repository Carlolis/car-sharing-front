import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

import type { Invoice } from '~/types/Invoice'

const columnHelper = createColumnHelper<Invoice>()

export function useInvoiceTable(loaderInvoices: readonly Invoice[]) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  useEffect(() => {
    setInvoices([...loaderInvoices])
  }, [loaderInvoices])
  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        header: 'Invoice Infos',
        footer: props => props.column.id,
        columns: [
          columnHelper.accessor('name', {
            header: () => <span>Name</span>,
            footer: props => props.column.id
          }),
          columnHelper.accessor('date', {
            header: () => <span>Date</span>,
            footer: props => props.column.id
          }),
          columnHelper.accessor('distance', {
            header: () => <span>Distance (km)</span>,
            footer: props => props.column.id
          }),
          columnHelper.accessor('drivers', {
            header: () => <span>Drivers</span>,
            footer: props => props.column.id,
            cell: ({ getValue }) => {
              const drivers = getValue<string[]>()
              return drivers.join(', ')
            }
          })
        ]
      }
    ],
    []
  )

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return table
}
