'use client'

import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import { Card, CardContent } from './card'

interface DataTableProps<TData,> {
  table: TanstackTable<TData>
}

export function DataTable<TData,>({ table }: DataTableProps<TData>) {
  return (
    <Card className="bg-white shadow-sm p-0">
      <CardContent className="p-0">
        <div className=" block overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup, i, arr) => (
                <tr
                  key={headerGroup.id}
                  className={i === arr.length - 1 ? 'border-b bg-gray-50/50' : // seulement au dernier
                  ''}
                >
                  {headerGroup.headers.map(header => (
                    <th
                      className="py-1  lg:text-base sm:min-w-[120px] text-center sm:text-left sm:px-2 "
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
                      className={`sm:p-2 p-1 ${
                        cell.column.id === 'drivers' ?
                          'max-w-20' :
                          cell.column.id === 'distance' ?
                          'max-w-8' :
                          'max-w-16'
                      }  sm:w-28`}
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
      </CardContent>
    </Card>
  )
}
