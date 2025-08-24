import { HttpServerRequest } from '@effect/platform'
import { FileSystem } from '@effect/platform/FileSystem'
import { FilesSchema } from '@effect/platform/Multipart'
import { pipe, Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import * as O from 'effect/Option'
import { TreeFormatter } from 'effect/ParseResult'
import { Minus, Plus, Receipt } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useActionData } from 'react-router'
import InvoiceForm from '~/components/invoice/invoiceForm'
import { useInvoiceTable } from '~/components/invoice/useInvoiceTable'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { SimpleTaggedError } from '~/runtime/errors/SimpleTaggedError'
import { Remix } from '~/runtime/Remix'
import { Redirect } from '~/runtime/ServerResponse'
import { InvoiceService } from '~/services/invoice'
import { DriversArrayEnsure, LocalDate } from '~/types/api'
import type { Route } from './+types/invoices'
export const loader = Remix.loader(
  T.gen(function* () {
    const invoiceService = yield* InvoiceService
    const invoices = yield* invoiceService.getInvoices
    return { invoices }
  })
)

const InvoiceCreateForm = Sc.Struct({
  name: Sc.String,
  date: LocalDate,
  distance: Sc.NumberFromString,
  drivers: DriversArrayEnsure,
  fileBytes: Sc.optional(FilesSchema),
  kind: Sc.String
})

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Creating Invoice....`)

    const api = yield* InvoiceService

    const invoiceCreate = yield* HttpServerRequest.schemaBodyForm(
      InvoiceCreateForm
    )

    const file = pipe(invoiceCreate.fileBytes, O.fromNullable, O.map(file => file[0].path))

    const fs = yield* FileSystem

    // Reading the content of the same file where this code is written

    const content = yield* pipe(
      file,
      T.flatMap(fs.readFile),
      T.tapError(T.logWarning),
      T.catchAll(() => T.succeed(undefined))
    )
    const fileName = pipe(
      invoiceCreate?.fileBytes,
      O.fromNullable,
      O.flatMapNullable(fileBytes => fileBytes[0]),
      O.map(r => r.name),
      O.getOrUndefined
    )

    // yield* T.logInfo(`Creating Invoice.... ${stringify(invoiceCreate)}`)
    const tripId = yield* api.createInvoice({
      ...invoiceCreate,
      fileBytes: content,
      fileName
    }).pipe(
      T.as({ invoiceName: invoiceCreate.name, _tag: 'InvoiceName' as const })
    )
    yield* T.logInfo(`Invoice created .... ${stringify(tripId)}`)
    return tripId
  }).pipe(
    T.catchTags({
      ResponseError: error =>
        T.gen(function* () {
          const text = yield* error.response.text
          yield* T.logError('Error text : ', text)
          yield* T.logError('Description :', error.description)

          return yield* T.succeed(SimpleTaggedError(stringify(text)))
        }),
      ParseError: error =>
        T.gen(function* () {
          yield* T.logError('Invoice Action Parse error  : ', TreeFormatter.formatErrorSync(error))
          return yield* T.succeed(SimpleTaggedError(TreeFormatter.formatErrorSync(error)))
        })
    }),
    // T.catchTags({
    //   HttpBodyError: error => T.succeed(SimpleTaggedError(stringify(error)))
    // }),
    T.tapError(T.logError),
    T.catchAll(() => new Redirect({ location: '/invoice/new' }))
  )
)

export default function InvoicesPage({ loaderData, actionData }: Route.ComponentProps) {
  const [showForm, setShowForm] = useState<boolean>(false)
  const { invoices } = loaderData
  const table = useInvoiceTable(invoices)

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [tripInfos, setTripInfos] = useState<string | undefined>(undefined)
  const handleToggleForm = () => {
    // if (updateTrip) {
    //   setUpdateTrip(undefined)
    //   return
    // }

    setShowForm(!showForm)
  }
  return (
    <div className="relative z-10 p-6 lg:p-12 w-full">
      <div className="space-y-6 lg:space-y-8 mx-auto px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3 lg:gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="w-12 h-12 bg-gradient-title-icon rounded-2xl flex items-center justify-center"
            >
              <Receipt className="h-6 w-6 text-[#F9F7F3]" />
            </motion.div>
            <div>
              <h1
                className="text-2xl lg:text-3xl font-semibold text-[#004D55] font-heading"
                style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
              >
                Factures
              </h1>
              <p
                className="text-[#6B7280] text-sm lg:text-base font-body"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Gestion des dépenses et remboursements
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Button
              onClick={handleToggleForm}
              className={`shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-3 min-h-[44px] whitespace-nowrap rounded-lg ${
                showForm ?
                  'bg-red-600 hover:bg-red-700 text-white' :
                  'bg-[#004D55] hover:bg-[#003640] text-white'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {showForm ?
                (
                  <>
                    <Minus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    <span className="hidden sm:inline">Annuler</span>
                    <span className="sm:hidden">Annuler</span>
                  </>
                ) :
                (
                  <>
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    <span className="hidden sm:inline">Nouvelle facture</span>
                    <span className="sm:hidden">Nouvelle</span>
                  </>
                )}
            </Button>
          </motion.div>
        </motion.div>
        <InvoiceForm actionData={actionData} showForm={showForm} updateInvoice={false} />
        <DataTable table={table} />
      </div>
    </div>
  )
}
