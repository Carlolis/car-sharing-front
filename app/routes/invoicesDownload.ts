import { HttpServerRequest } from '@effect/platform'
import { Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { Remix } from '~/runtime/Remix'
import { Unexpected } from '~/runtime/ServerResponse'
import { InvoiceService } from '~/services/invoice'

export const loader = Remix.loader(
  T.gen(function* () {
    const invoiceService = yield* InvoiceService
    yield* T.logInfo(`About to download an invoice....`)
    const { fileName, id } = yield* HttpServerRequest.schemaSearchParams(Sc.Struct({
      id: Sc.String,
      fileName: Sc.String
    }))
    const uint8Array = yield* invoiceService.downloadInvoiceFile(fileName, id)

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${fileName}`
      }
    })
  }).pipe(
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchTag('ResponseError', error => new Unexpected({ error: error.message }))
  )
)
