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
import { TableEditAndDelete } from '../buttons/TableEditAndDelete'
import { Badge } from '../ui/badge'
import { useIsMobile } from '../ui/use-mobile'

const columnHelper = createColumnHelper<Invoice>()
// Nouvelles couleurs avec un meilleur contraste pour l'accessibilité
const getTypeColors = (type: string) => {
  const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
    'Carburant': {
      bg: '#004D55',
      text: '#FFFFFF',
      border: '#003640'
    },
    'Entretien': {
      bg: '#D91A5B',
      text: '#FFFFFF',
      border: '#B91450'
    },
    'Assurance': {
      bg: '#EA6100',
      text: '#FFFFFF',
      border: '#D15500'
    },
    'Réparation': {
      bg: '#DC2626',
      text: '#FFFFFF',
      border: '#B91C1C'
    },
    'Contrôle technique': {
      bg: '#0891B2',
      text: '#FFFFFF',
      border: '#0E7490'
    },
    'Péage': {
      bg: '#059669',
      text: '#FFFFFF',
      border: '#047857'
    },
    'Parking': {
      bg: '#7C3AED',
      text: '#FFFFFF',
      border: '#6D28D9'
    },
    'Lavage': {
      bg: '#C2410C',
      text: '#FFFFFF',
      border: '#9A3412'
    },
    'Autre': {
      bg: '#374151',
      text: '#FFFFFF',
      border: '#1F2937'
    }
  }
  return colorMap[type] || { bg: '#374151', text: '#FFFFFF', border: '#1F2937' }
}
export function useInvoiceTable(
  loaderInvoices: readonly Invoice[],
  setInvoiceUpdate: (tripUpdate: Invoice | undefined) => void
) {
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  useEffect(() => {
    setInvoices([...loaderInvoices])
  }, [loaderInvoices])

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        id: 'invoices',
        header: () => (
          <div className="flex items-center gap-3 w-full p-2 ">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="min-w-[24px] min-h-[24px] flex items-center justify-center"
            >
              <Receipt className="h-5 w-5 text-[#004D55]" />
            </motion.div>
            <span
              className="text-sm sm:text-lg  lg:text-xl text-[#004D55] font-semibold text-left font-heading"
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
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Date
              </span>
            ),
            footer: props => props.column.id,
            cell: ({ getValue }) => (
              <span
                className="text-left sm:p-4 text-[#004D55]  text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ?
                  new Intl.DateTimeFormat('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                  }).format(getValue<Date>()) :
                  getValue<Date>().toLocaleDateString('fr-FR')}
              </span>
            )
          }),
          columnHelper.accessor('kind', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Type
              </span>
            ),
            cell: ({ getValue }) => {
              const type = getValue() as string

              const typeColors = getTypeColors(type)

              return (
                <Badge
                  className="text-xs px-2 py-1 font-body font-medium border-0"
                  style={{
                    backgroundColor: typeColors.bg,
                    color: typeColors.text,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  {isMobile ? type[0] : type}
                </Badge>
              )
            },
            footer: props => props.column.id
          }),
          columnHelper.accessor('name', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm "
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Nom
              </span>
            ),
            cell: ({ getValue }) => (
              <div
                className=" sm:p-4 text-[#004D55]  text-xs sm:text-sm truncate w-full"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {getValue()}
              </div>
            ),
            footer: props => props.column.id
          }),
          columnHelper.accessor('amount', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? '€' : 'Montant'}
              </span>
            ),
            cell: ({ getValue }) => (
              <span
                className=" sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {getValue()} {isMobile ? null : '€'}
              </span>
            ),
            footer: props => props.column.id
          }),

          columnHelper.accessor('mileage', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Km' : 'Kilométrage'}
              </span>
            ),
            cell: ({ getValue }) => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {getValue()} {isMobile ? null : 'Km'}
              </span>
            ),
            footer: props => props.column.id
          }),
          columnHelper.accessor('drivers', {
            header: () => (
              <span
                className="text-left p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Par' : 'Payé par'}
              </span>
            ),
            footer: props => props.column.id,
            cell: ({ getValue }) => {
              const drivers = getValue<string[]>()
              return (
                <span className="text-left p-4 text-[#004D55] font-semibold text-xs sm:text-sm">
                  {drivers.join(', ')}
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
                setDataUpdate={setInvoiceUpdate}
                entityType="invoice"
              />
            )
          })
        ]
      }
    ],
    [invoices.length, isMobile, setInvoiceUpdate]
  )

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return table
}
