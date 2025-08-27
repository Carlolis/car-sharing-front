import { HttpServerRequest } from '@effect/platform'
import { Loader } from 'components/ui/shadcn-io/ai/loader'
import * as T from 'effect/Effect'
import { Minus, Plus, Receipt } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useNavigation } from 'react-router'
import { InvoiceActions } from '~/components/invoice/InvoiceActions'
import InvoiceForm from '~/components/invoice/invoiceForm'
import { matcherInvoiceActions } from '~/components/invoice/matcherInvoiceActions'
import { Reimbursement } from '~/components/invoice/reimbursement'
import { useInvoiceTable } from '~/components/invoice/useInvoiceTable'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { useIsMobile } from '~/components/ui/use-mobile'
import { Remix } from '~/runtime/Remix'
import { Redirect, Unexpected } from '~/runtime/ServerResponse'
import { InvoiceService } from '~/services/invoice'
import type { Invoice } from '~/types/Invoice'
import type { Route } from './+types/invoices'

export const loader = Remix.loader(
  T.gen(function* () {
    const invoiceService = yield* InvoiceService
    const invoices = yield* invoiceService.getAllInvoices()
    return { invoices }
  }).pipe(
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchTag('ResponseError', error => new Unexpected({ error: error.message }))
  )
)

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Invoice actions trigged....`)

    const request = yield* HttpServerRequest.schemaBodyForm(InvoiceActions)
    return yield* matcherInvoiceActions(request)
  }).pipe(
    T.tapError(T.logError),
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchAll(() => new Redirect({ location: '/invoices' }))
  )
)

export default function InvoicesPage({ loaderData, actionData }: Route.ComponentProps) {
  const isMobile = useIsMobile()
  const navigation = useNavigation()
  const isLoading = navigation.formAction == '/invoices'
  const [invoiceUpdate, setInvoiceUpdate] = useState<Invoice | undefined>(undefined)

  const [showForm, setShowForm] = useState<boolean>(false)
  const { invoices } = loaderData
  const table = useInvoiceTable(invoices, setInvoiceUpdate)

  const handleToggleForm = () => {
    if (invoiceUpdate) {
      setInvoiceUpdate(undefined)
      return
    }

    setShowForm(!showForm)
  }
  return (
    <div className="relative z-10 p-3 lg:p-12 w-full">
      <div className="space-y-6 lg:space-y-8 mx-auto sm:px-10">
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
                showForm || invoiceUpdate ?
                  'bg-red-600 hover:bg-red-700 text-white' :
                  'bg-[#004D55] hover:bg-[#003640] text-white'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {showForm || invoiceUpdate ?
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
        <InvoiceForm
          actionData={actionData}
          showForm={showForm}
          updateInvoice={invoiceUpdate}
          isLoading={isLoading}
          setShowForm={setShowForm}
          setInvoiceUpdate={setInvoiceUpdate}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-xl lg:text-2xl font-semibold text-[#004D55] font-heading">
            Vos Factures
          </h2>
          <a
            href="https://nextcloud.ilieff.fr/s/kYtspimb5PTzn2W"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gradient-factures text-[#004D55] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm lg:text-base font-medium"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <Receipt className="h-4 w-4 mr-2" />
            {isMobile ? 'Voir les factures' : 'Voir les factures sur Nextcloud'}
          </a>
        </motion.div>
        {isLoading ? <Loader /> : <DataTable table={table} />}
        <Reimbursement />
      </div>
    </div>
  )
}
