import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { CheckCircle, Clock, Wrench } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import type { Maintenance } from '~/types/Maintenance'
import { TableEditAndDelete } from '../buttons/TableEditAndDelete'
import { Badge } from '../ui/badge'
import { useIsMobile } from '../ui/use-mobile'

const columnHelper = createColumnHelper<Maintenance>()

const getStatusBadge = (isCompleted: boolean, isMobile: boolean) => {
  if (isCompleted) {
    return (
      <Badge
        className="text-xs px-2 py-1 font-body font-medium border-0"
        style={{
          backgroundColor: '#059669',
          color: '#FFFFFF',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        {isMobile ? 'OK' : 'Terminé'}
      </Badge>
    )
  }

  return (
    <Badge
      className="text-xs px-2 py-1 font-body font-medium border-0"
      style={{
        backgroundColor: '#D91A5B',
        color: '#FFFFFF',
        fontFamily: 'Montserrat, sans-serif'
      }}
    >
      <Clock className="h-3 w-3 mr-1" />
      {isMobile ? 'À faire' : 'En attente'}
    </Badge>
  )
}

const getTypeColors = (type: string) => {
  const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
    'Vidange': {
      bg: '#0891B2',
      text: '#FFFFFF',
      border: '#0E7490'
    },
    'Contrôle Technique': {
      bg: '#7C3AED',
      text: '#FFFFFF',
      border: '#6D28D9'
    },
    'Freins': {
      bg: '#D91A5B',
      text: '#FFFFFF',
      border: '#B91450'
    },
    'Pneus': {
      bg: '#374151',
      text: '#FFFFFF',
      border: '#1F2937'
    },
    'Révision': {
      bg: '#059669',
      text: '#FFFFFF',
      border: '#047857'
    },
    'Autre': {
      bg: '#6B7280',
      text: '#FFFFFF',
      border: '#4B5563'
    }
  }
  return colorMap[type] || { bg: '#6B7280', text: '#FFFFFF', border: '#4B5563' }
}

export function useMaintenanceTable(
  loaderMaintenance: readonly Maintenance[],
  setMaintenanceUpdate: (maintenance: Maintenance | undefined) => void
) {
  const isMobile = useIsMobile()
  const [maintenance, setMaintenance] = useState<Maintenance[]>([])

  useEffect(() => {
    setMaintenance([...loaderMaintenance])
  }, [loaderMaintenance])

  const columns = useMemo<ColumnDef<Maintenance>[]>(
    () => [
      {
        id: 'maintenance',
        header: () => (
          <div className="flex items-center gap-3 w-full p-2 ">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="min-w-[24px] min-h-[24px] flex items-center justify-center"
            >
              <Wrench className="h-5 w-5 text-[#004D55]" />
            </motion.div>
            <span
              className="text-sm sm:text-lg  lg:text-xl text-[#004D55] font-semibold text-left font-heading"
              style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
            >
              Liste des entretiens
            </span>
            {maintenance.length > 0 && (
              <Badge
                className="bg-gradient-to-r from-[#004D55] to-[#003640] text-white border-0 shadow-sm text-xs lg:text-sm px-2 py-1 ml-auto font-body"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {maintenance.length} entretien{maintenance.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        ),
        footer: props => props.column.id,
        columns: [
          columnHelper.accessor('type', {
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
                  {isMobile ? type.substring(0, 3) : type}
                </Badge>
              )
            },
            footer: props => props.column.id
          }),
          columnHelper.accessor('isCompleted', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Statut
              </span>
            ),
            cell: ({ getValue }) => getStatusBadge(getValue() as boolean, isMobile),
            footer: props => props.column.id
          }),
          columnHelper.accessor('dueDate', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Date due' : 'Date prévue'}
              </span>
            ),
            cell: ({ getValue }) => {
              const date = getValue() as Date | undefined
              if (!date) return <span className="text-gray-400">-</span>

              return (
                <span
                  className="text-left sm:p-4 text-[#004D55] text-xs sm:text-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {isMobile ?
                    new Intl.DateTimeFormat('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    }).format(date) :
                    new Date(date).toLocaleDateString('fr-FR')}
                </span>
              )
            },
            footer: props => props.column.id
          }),
          columnHelper.accessor('dueMileage', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Km' : 'Kilométrage'}
              </span>
            ),
            cell: ({ getValue }) => {
              const mileage = getValue() as number | undefined
              if (!mileage) return <span className="text-gray-400">-</span>

              return (
                <span
                  className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {mileage} {isMobile ? null : 'km'}
                </span>
              )
            },
            footer: props => props.column.id
          }),
          columnHelper.accessor('completedDate', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isMobile ? 'Fait le' : 'Date réalisée'}
              </span>
            ),
            cell: ({ getValue }) => {
              const date = getValue() as Date | undefined
              if (!date) return <span className="text-gray-400">-</span>

              return (
                <span
                  className="text-left sm:p-4 text-[#004D55] text-xs sm:text-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {isMobile ?
                    new Intl.DateTimeFormat('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    }).format(date) :
                    new Date(date).toLocaleDateString('fr-FR')}
                </span>
              )
            },
            footer: props => props.column.id
          }),
          columnHelper.accessor('description', {
            header: () => (
              <span
                className="text-left sm:p-4 text-[#004D55] font-semibold text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Description
              </span>
            ),
            cell: ({ getValue }) => {
              const description = getValue() as string | undefined
              if (!description) return <span className="text-gray-400">-</span>

              return (
                <div
                  className="sm:p-4 text-[#004D55] text-xs sm:text-sm truncate max-w-[150px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                  title={description}
                >
                  {description}
                </div>
              )
            },
            footer: props => props.column.id
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
                setDataUpdate={setMaintenanceUpdate}
                entityType="maintenance"
              />
            )
          })
        ]
      }
    ],
    [maintenance.length, isMobile, setMaintenanceUpdate]
  )

  const table = useReactTable({
    data: maintenance,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return table
}
