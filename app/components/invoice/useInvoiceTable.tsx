import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Receipt } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import type { Invoice } from '~/types/Invoice'
import { Badge } from '../ui/badge'

const columnHelper = createColumnHelper<Invoice>()

export function useInvoiceTable(loaderInvoices: readonly Invoice[]) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  useEffect(() => {
    setInvoices([...loaderInvoices])
  }, [loaderInvoices])

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        id: 'invoices',
        header: () => (
          <div className="flex items-center gap-3 w-full p-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="min-w-[24px] min-h-[24px] flex items-center justify-center"
            >
              <Receipt className="h-5 w-5 text-[#004D55]" />
            </motion.div>
            <span
              className="text-lg lg:text-xl text-[#004D55] font-semibold text-left font-heading"
              style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
            >
              Liste des factures
            </span>
            {invoices.length > 0 && (
              <Badge
                className="bg-gradient-to-r from-[#004D55] to-[#003640] text-white border-0 shadow-sm text-xs lg:text-sm px-2 py-1 ml-auto font-body"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {invoices.length} facture{invoices.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        ),
        footer: props => props.column.id,
        columns: [
          columnHelper.accessor('date', {
            header: () => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Date
              </span>
            ),
            footer: props => props.column.id,
            cell: ({ getValue }) => (
              <span
                className="text-left p-4 text-[#004D55]  text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {getValue<Date>().toLocaleDateString('fr-FR')}
              </span>
            )
          }),
          columnHelper.accessor('kind', {
            header: () => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Type
              </span>
            ),
            cell: ({ getValue }) => (
              <span
                className="text-left p-4 text-[#004D55]  text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {getValue()}
              </span>
            ),
            footer: props => props.column.id
          }),
          columnHelper.accessor('name', {
            header: () => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Nom
              </span>
            ),
            cell: ({ getValue }) => (
              <span
                className="text-left p-4 text-[#004D55]  text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {getValue()}
              </span>
            ),
            footer: props => props.column.id
          }),
          columnHelper.accessor('amount', {
            header: () => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Montant
              </span>
            ),
            cell: ({ getValue }) => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {getValue()} €
              </span>
            ),
            footer: props => props.column.id
          }),

          columnHelper.accessor('mileage', {
            header: () => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Kilométrage
              </span>
            ),
            cell: ({ getValue }) => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {getValue()} Km
              </span>
            ),
            footer: props => props.column.id
          }),
          columnHelper.accessor('drivers', {
            header: () => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Payé par
              </span>
            ),
            footer: props => props.column.id,
            cell: ({ getValue }) => {
              const drivers = getValue<string[]>()
              return drivers.join(', ')
            }
          })
        ]
      }
    ],
    [invoices.length]
  )

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return table
}
