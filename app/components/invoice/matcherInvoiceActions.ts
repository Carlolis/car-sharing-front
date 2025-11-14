import { Match, pipe } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import * as O from 'effect/Option'
import { SimpleTaggedError } from '~/runtime/errors/SimpleTaggedError'

import { FileSystem } from '@effect/platform/FileSystem'
import { TreeFormatter } from 'effect/ParseResult'
import { InvoiceService } from '~/services/invoice'
import { type InvoiceActions } from './InvoiceActions'

export const matcherInvoiceActions = (request: InvoiceActions) =>
  T.gen(function* () {
    yield* T.logInfo(`Invoice action request: ${stringify(request)}`)
    const api = yield* InvoiceService
    return yield* Match.type<InvoiceActions>().pipe(
      Match.tag('delete', ({ invoiceId: invoiceId }) =>
        T.gen(function* () {
          yield* T.logInfo('Deleting invoice...')
          return yield* api.deleteInvoice(invoiceId)
        })),
      Match.tag('update', invoiceUpdate =>
        T.gen(function* () {
          yield* T.logInfo(`Invoice updating invoice action .... ${stringify(invoiceUpdate)}`)

          const file = pipe(invoiceUpdate.fileBytes, O.fromNullable, O.map(file => file[0].path))

          const fs = yield* FileSystem

          const content = yield* pipe(
            file,
            T.flatMap(fs.readFile),
            T.tapError(T.logWarning),
            T.catchAll(() => T.succeed(undefined))
          )
          const fileName = pipe(
            invoiceUpdate?.fileBytes,
            O.fromNullable,
            O.flatMapNullable(fileBytes => fileBytes[0]),
            O.map(r => r.name),
            O.getOrElse(() => invoiceUpdate.fileName)
          )

          const invoiceId = yield* api.updateInvoice({
            ...invoiceUpdate,
            fileBytes: content,
            fileName,
            date: new Date(invoiceUpdate.date)
          }).pipe(
            T.as({ invoiceName: invoiceUpdate.name, _tag: 'InvoiceName' as const })
          )

          yield* T.logInfo(`Invoice updated .... ${stringify(invoiceId)}`)

          return invoiceId
        })),
      Match.tag('create', invoiceCreate =>
        T.gen(function* () {
          yield* T.logInfo(`Invoice creating invoice action .... ${stringify(invoiceCreate)}`)

          yield* T.logInfo(`Creating Invoice....`)

          const api = yield* InvoiceService

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
          const invoiceId = yield* api.createInvoice({
            ...invoiceCreate,
            fileBytes: content,
            fileName
          }).pipe(
            T.as({ invoiceName: invoiceCreate.name, _tag: 'InvoiceName' as const })
          )
          yield* T.logInfo(`Invoice created .... ${stringify(invoiceId)}`)

          return invoiceId
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
    T.catchTags({
      ResponseError: error =>
        T.gen(function* () {
          const text = yield* error.response.text
          yield* T.logError('Status Code : ', error.response.status)
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
    T.catchAll(error => T.succeed(SimpleTaggedError(stringify(error))))
  )
