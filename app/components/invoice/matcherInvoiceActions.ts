import { type ClassValue, clsx } from 'clsx'
import { Match, pipe } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { twMerge } from 'tailwind-merge'

import { SimpleTaggedError } from '~/runtime/errors/SimpleTaggedError'

import { InvoiceService } from '~/services/invoice'
import type { InvoiceActions } from './InvoiceActions'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const matcherInvoiceActions = (request: InvoiceActions) =>
  T.gen(function* () {
    yield* T.logDebug(`Invoice action request: ${stringify(request)}`)
    const api = yield* InvoiceService
    return yield* Match.type<InvoiceActions>().pipe(
      Match.tag('delete', ({ invoiceId: invoiceId }) =>
        T.gen(function* () {
          yield* T.logInfo('Deleting invoice...')
          yield* api.deleteInvoice(invoiceId)

          yield* T.logInfo(`Invoice deleted: ${stringify(invoiceId)}`)

          return { invoiceId }
        })),
      Match.tag('update', ({ invoiceUpdate }) =>
        T.gen(function* () {
          yield* T.logInfo(`Invoice updating invoice action .... ${stringify(invoiceUpdate)}`)

          const invoiceId = yield* api.updateInvoice(invoiceUpdate)

          yield* T.logInfo(`Invoice updated .... ${stringify(invoiceId)}`)

          return { invoiceId }
        })),
      Match.tag('create', ({ invoiceCreate }) =>
        T.gen(function* () {
          yield* T.logInfo(`Invoice creating invoice action .... ${stringify(invoiceCreate)}`)

          const invoiceId = yield* api.createInvoice(invoiceCreate)

          yield* T.logInfo(`Invoice created .... ${stringify(invoiceId)}`)

          return { invoiceId }
        })),
      Match.exhaustive
    )(request)
  }).pipe(
    T.tapError(T.logError),
    T.catchTag('ResponseError', error =>
      T.gen(function* () {
        if (error.response.status === 405) {
          return yield* pipe(
            error.response.text,
            T.tap(error => T.logError('Unauthorized Error 405', error)),
            T.flatMap(errorText =>
              T.succeed(
                SimpleTaggedError(
                  `Unauthorized Error 405  ${errorText} for url : ${error.methodAndUrl}`
                )
              )
            )
          )
        }
        return yield* T.fail(error)
      })),
    T.catchAll(error => T.succeed(SimpleTaggedError(stringify(error))))
  )
