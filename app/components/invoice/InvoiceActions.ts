import { FilesSchema } from '@effect/platform/Multipart'
import { Schema as Sc } from 'effect'
import { LocalDate } from '~/types/api'

export const InvoiceCreateFormTagged = Sc.Struct({
  _tag: Sc.Literal('create'),
  name: Sc.String,
  date: LocalDate,
  mileage: Sc.String,
  driver: Sc.String,
  fileBytes: Sc.optional(FilesSchema),
  kind: Sc.String,
  amount: Sc.NumberFromString
  // isReimbursement: Sc.optional(Sc.Literal('true', 'false'))
})

export const InvoiceUpdateFormTagged = Sc.Struct({
  _tag: Sc.Literal('update'),
  id: Sc.UUID,
  name: Sc.String,
  date: LocalDate,
  mileage: Sc.String,
  driver: Sc.String,
  fileBytes: Sc.optional(FilesSchema),
  kind: Sc.String,
  amount: Sc.NumberFromString,
  toDriver: Sc.optional(Sc.String)
  // isReimbursement: Sc.optional(Sc.Literal('true', 'false'))
})

export const TaggedDeleteInvoice = Sc.TaggedStruct('delete', {
  invoiceId: Sc.UUID
})

export type TaggedDeleteTrip = Sc.Schema.Type<typeof TaggedDeleteInvoice>

export const InvoiceActions = Sc.Union(
  TaggedDeleteInvoice,
  InvoiceUpdateFormTagged,
  InvoiceCreateFormTagged
)

export type InvoiceActions = typeof InvoiceActions.Type
