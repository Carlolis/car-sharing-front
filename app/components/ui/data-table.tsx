'use client'

import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'

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
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th className="py-2" key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-gray-200">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={`border-r border-gray-200 p-4 ${
                      cell.column.id === 'distance' ? 'w-32' : ''
                    }`}
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
