import { FilesSchema } from '@effect/platform/Multipart'
import { Schema as Sc } from 'effect'
import { DriversArrayEnsure, LocalDate } from '~/types/api'
import { InvoiceUpdate } from '~/types/InvoiceUpdate'

export const TaggedUpdateInvoice = Sc.TaggedStruct('update', {
  invoiceUpdate: InvoiceUpdate
})

export const InvoiceCreateFormTagged = Sc.Struct({
  _tag: Sc.Literal('create'),
  name: Sc.String,
  date: LocalDate,
  mileage: Sc.String,
  drivers: DriversArrayEnsure,
  fileBytes: Sc.optional(FilesSchema),
  kind: Sc.String,
  amount: Sc.NumberFromString
})
export type TaggedUpdateInvoice = Sc.Schema.Type<typeof TaggedUpdateInvoice>

export const TaggedDeleteInvoice = Sc.TaggedStruct('delete', {
  invoiceId: Sc.UUID
})
export type TaggedDeleteTrip = Sc.Schema.Type<typeof TaggedDeleteInvoice>

export const InvoiceActions = Sc.Union(
  TaggedDeleteInvoice,
  // TaggedUpdateInvoice,
  InvoiceCreateFormTagged
)

export type InvoiceActions = typeof InvoiceActions.Type
