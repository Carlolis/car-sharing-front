import { HttpServerRequest } from '@effect/platform'
import { Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { Remix } from '~/runtime/Remix'
import { InvoiceService } from '~/services/invoice'

export const loader = Remix.loader(
  T.gen(function* () {
    const invoiceService = yield* InvoiceService
    yield* T.logInfo(`Getting token....`)
    const { fileName, id } = yield* HttpServerRequest.schemaSearchParams(Sc.Struct({
      id: Sc.String,
      fileName: Sc.String
    }))
    const pdfData = yield* invoiceService.downloadInvoiceFile(fileName, id)
    return new Response(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`
      }
    })
  })
)
