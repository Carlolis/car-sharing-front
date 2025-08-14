'use client'

import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import { Route } from 'lucide-react'

interface DataTableProps<TData,> {
  table: TanstackTable<TData>
}

export function DataTable<TData,>({ table }: DataTableProps<TData>) {
  return (
    <div className="mt-8 ">
      <div className="bg-white shadow-md rounded-lg overflow-hidden ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr
                key={headerGroup.id}
                className="bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150"
              >
                {headerGroup.headers.map(header => (
                  <th
                    className="text-slate-800 text-sm lg:text-base min-w-[120px] text-left px-2"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="p-2 lg:p-4">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={` p-2 ${cell.column.id === 'distance' ? 'w-32' : ''}`}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
