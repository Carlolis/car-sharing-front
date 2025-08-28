import { HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { Chunk as Ch, pipe, Schema as Sc, Stream as St } from 'effect'

import type { HttpClientError } from '@effect/platform/HttpClientError'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import type { ParseError } from 'effect/ParseResult'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { NotAuthenticated } from '~/runtime/errors/NotAuthenticatedError'
import type { Redirect } from '~/runtime/ServerResponse'
import { Invoice } from '~/types/Invoice'
import type { InvoiceCreate } from '~/types/InvoiceCreate'
import type { InvoiceUpdate } from '~/types/InvoiceUpdate'

import type { Chunk } from 'effect/Chunk'
import { TaggedInvoiceId } from '~/types/InvoiceId'
import { HttpService } from './httpClient'

// @effect-diagnostics-next-line leakingRequirements:off
export class InvoiceService extends T.Service<InvoiceService>()('InvoiceService', {
  effect: T.gen(function* () {
    const { defaultClient, postRequest, getRequest, deleteRequest, putRequest } = yield* HttpService

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
          fileBytes: invoice.fileBytes?.length
        })
        const invoiceUrl = pipe(postRequest, HttpClientRequest.appendUrl('/invoices'))
        const formData = new FormData()
        formData.append('name', invoice.name)
        if (invoice.fileBytes) {
          formData.append('fileBytes', new Blob([invoice.fileBytes]), 'invoice.pdf')
        }

        formData.append('date', invoice.date.toISOString().split('T')[0])

        if (invoice.mileage.length) formData.append('mileage', JSON.stringify(+invoice.mileage))

        formData.append('amount', JSON.stringify(invoice.amount))

        formData.append('fileName', JSON.stringify(invoice.fileName))
        formData.append('kind', invoice.kind)
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
        T.tapError(T.logError),
        T.annotateLogs(InvoiceService.name, createInvoice.name)
      )

    const getAllInvoices = () =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()
        yield* T.logDebug(`Found token....`, token)

        const getAllInvoicesRequest = pipe(
          getRequest,
          HttpClientRequest.appendUrl('/invoices'),
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`)
        )
        const response = yield* defaultClient.execute(getAllInvoicesRequest)

        const responseJson = yield* pipe(
          HttpClientResponse.schemaBodyJson(Sc.Array(Invoice))(response),
          T.tapError(T.logError),
          T.catchAll(() => T.succeed<readonly Invoice[]>([]))
        )

        yield* T.logInfo(`Found ${stringify(responseJson.length)} invoices`)

        return responseJson
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        T.tapError(T.logError),
        T.annotateLogs(InvoiceService.name, getAllInvoices.name)
      )

    const deleteInvoice = (invoiceId: string) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()

        const deleteUrl = pipe(
          deleteRequest,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.appendUrl(`/invoices/${invoiceId}`)
        )
        const response = yield* defaultClient.execute(deleteUrl)
        yield* T.logInfo('InvoiceService deleteInvoice response :', response)

        return yield* pipe(
          response,
          HttpClientResponse.schemaBodyJson(Sc.String),
          T.map(invoiceId => TaggedInvoiceId.make({ invoiceId }))
        )
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        T.tapError(T.logError),
        T.annotateLogs(InvoiceService.name, deleteInvoice.name)
      )

    const updateInvoice = (invoice: InvoiceUpdate) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()

        yield* T.logInfo(`About to update invoice...`, {
          ...invoice,
          fileBytes: invoice.fileBytes?.length
        })

        const invoiceUrl = pipe(putRequest, HttpClientRequest.appendUrl('/invoices'))
        const formData = new FormData()

        formData.append('id', invoice.id)
        formData.append('name', invoice.name)
        if (invoice.fileBytes) {
          formData.append('fileBytes', new Blob([invoice.fileBytes]), 'invoice.pdf')
        }

        formData.append('date', invoice.date.toISOString().split('T')[0])

        if (invoice.mileage.length) formData.append('mileage', JSON.stringify(+invoice.mileage))

        formData.append('amount', JSON.stringify(invoice.amount))

        formData.append('fileName', JSON.stringify(invoice.fileName))
        formData.append('kind', invoice.kind)
        invoice.drivers.forEach(driver => formData.append('drivers', driver))

        const updateInvoiceRequest = pipe(
          invoiceUrl,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.bodyFormData(formData)
        )

        const response = yield* defaultClient.execute(updateInvoiceRequest).pipe(
          T.tapError(T.logError)
        )

        return yield* pipe(
          response,
          HttpClientResponse.schemaBodyJson(Sc.String),
          T.map(invoiceId => TaggedInvoiceId.make({ invoiceId }))
        )
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        T.tapError(T.logError),
        T.annotateLogs(InvoiceService.name, updateInvoice.name)
      )

    const downloadInvoiceFile = (
      fileName: string,
      id: string
    ) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logInfo(`Getting token....`)
        const token = yield* cookieSession.getUserToken()

        const downloadUrl = pipe(
          getRequest,
          HttpClientRequest.appendUrl(`/invoices/download/${encodeURIComponent(fileName)}/${id}`),
          HttpClientRequest.setHeader('Accept', 'application/pdf,application/octet-stream,*/*'),
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`)
        )

        const response = defaultClient.execute(downloadUrl)
        const uint8Array: St.Stream<Uint8Array<ArrayBufferLike>, HttpClientError, never> = pipe(
          response,
          HttpClientResponse.stream
        )

        // const arrayBufferLike: St.Stream<ArrayBufferLike, HttpClientError, never> = pipe(
        //   uint8Array,
        //   St.map(u => u.buffer)
        // )

        const collectChunks: T.Effect<Chunk<ArrayBufferLike>, HttpClientError, never> = pipe(
          uint8Array,
          St.runCollect
        )

        yield* T.logInfo(`Downloaded stream....`)
        // ancien code
        // const blob = yield* T.promise(() => response.blob())
        // const arrayBuffer = yield* T.promise(() => blob.arrayBuffer())
        // return new Uint8Array(arrayBuffer)

        const chunks = yield* collectChunks

        const totalLength = pipe(
          chunks,
          Ch.reduce(0, (acc, c) => acc + (c.byteLength))
        )
        const result = new Uint8Array(totalLength)
        pipe(
          chunks,
          Ch.reduce(0, (offset, c) => {
            const u = ArrayBuffer.isView(c) ?
              (c as unknown as Uint8Array) :
              new Uint8Array(c as ArrayBuffer)
            result.set(u, offset)
            return offset + u.length
          })
        )

        return result
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        T.catchTag('RequestError', error =>
          T.gen(function* () {
            // eslint-disable-next-line no-console
            console.error(error.message)

            return yield* T.fail(error)
          })),
        T.tapError(T.logError),
        T.annotateLogs(InvoiceService.name, downloadInvoiceFile.name)
      )

    return ({
      updateInvoice,
      deleteInvoice,
      createInvoice,
      getAllInvoices,
      downloadInvoiceFile
    })
  })
}) {}

export const InvoiceLayer = InvoiceService.Default
