import * as T from 'effect/Effect'
import { useInvoiceTable } from '~/components/invoice/useInvoiceTable'
import { DataTable } from '~/components/ui/data-table'
import { Remix } from '~/runtime/Remix'
import { InvoiceService } from '~/services/invoice'
import type { Route } from './+types/invoices'

export const loader = Remix.loader(
  T.gen(function* () {
    const invoiceService = yield* InvoiceService
    const invoices = yield* invoiceService.getInvoices
    return { invoices }
  })
)

export default function InvoicesPage({ loaderData }: Route.ComponentProps) {
  const { invoices } = loaderData
  const table = useInvoiceTable(invoices)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <DataTable table={table} />
    </div>
  )
}
