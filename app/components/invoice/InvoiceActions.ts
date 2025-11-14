import { FilesSchema } from '@effect/platform/Multipart'
import { Schema as Sc } from 'effect'
import { InvoiceKinds } from '~/types/Invoice'
import { FormattedLocalDate } from '../../types/FormattedLocalDate'

export const InvoiceCreateFormTagged = Sc.Struct({
  _tag: Sc.Literal('create'),
  name: Sc.String,
  date: FormattedLocalDate,
  mileage: Sc.String,
  driver: Sc.String,
  fileBytes: Sc.optional(FilesSchema),
  kind: Sc.String,
  amount: Sc.NumberFromString,
  toDriver: Sc.optional(Sc.String)
})

export const InvoiceUpdateFormTagged = Sc.Struct({
  _tag: Sc.Literal('update'),
  id: Sc.UUID,
  name: Sc.String,
  date: FormattedLocalDate,
  mileage: Sc.String,
  driver: Sc.String,
  fileBytes: Sc.optional(FilesSchema),
  fileName: Sc.optional(Sc.String),
  kind: InvoiceKinds,
  amount: Sc.NumberFromString,
  toDriver: Sc.optional(Sc.String)
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
