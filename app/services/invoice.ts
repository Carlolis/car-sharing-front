import { HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'

import type { HttpClientError } from '@effect/platform/HttpClientError'
import * as T from 'effect/Effect'
import type { ParseError } from 'effect/ParseResult'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import type { Redirect } from '~/runtime/ServerResponse'
import type { InvoiceCreate } from '~/types/InvoiceCreate'
import { HttpService } from './httpClient'

export class InvoiceService extends T.Service<InvoiceService>()('InvoiceService', {
  effect: T.gen(function* () {
    const { defaultClient, postRequest } = yield* HttpService

    const createInvoice: (
      invoice: InvoiceCreate
    ) => T.Effect<string, HttpClientError | ParseError | Redirect, CookieSessionStorage> = (
      invoice: InvoiceCreate
    ) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage

        const token = yield* cookieSession.getUserToken()
        yield* T.logInfo(`About to save invoice...`, {
          ...invoice,
          fileBytes: invoice.fileBytes.length
        })
        const invoiceUrl = pipe(postRequest, HttpClientRequest.appendUrl('/invoices'))
        const formData = new FormData()
        formData.append('name', invoice.name)
        formData.append('fileBytes', new Blob([invoice.fileBytes]), 'invoice.pdf')
        formData.append('date', invoice.date.toISOString().split('T')[0])
        formData.append('distance', JSON.stringify(invoice.distance))
        invoice.drivers.forEach(driver => formData.append('drivers', driver))

        const createInvoiceRequest = pipe(
          invoiceUrl,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.bodyFormData(formData)
        )

        const response = yield* defaultClient.execute(createInvoiceRequest).pipe(
          T.tapError(T.logError)
        )
        return yield* HttpClientResponse.schemaBodyJson(Sc.String)(response)
      }).pipe(
        T.annotateLogs(InvoiceService.name, createInvoice.name)
      )

    return ({
      createInvoice
    })
  })
}) {}

export const InvoiceLayer = InvoiceService.Default
