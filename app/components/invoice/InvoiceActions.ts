import { Schema as Sc } from 'effect'
import { InvoiceCreate } from '~/types/InvoiceCreate'
import { InvoiceUpdate } from '~/types/InvoiceUpdate'

export const TaggedUpdateInvoice = Sc.TaggedStruct('update', {
  invoiceUpdate: InvoiceUpdate
})

export const TaggedCreateInvoice = Sc.TaggedStruct('create', {
  invoiceCreate: InvoiceCreate
})
export type TaggedUpdateInvoice = Sc.Schema.Type<typeof TaggedUpdateInvoice>

export const TaggedDeleteInvoice = Sc.TaggedStruct('delete', {
  invoiceId: Sc.UUID
})
export type TaggedDeleteTrip = Sc.Schema.Type<typeof TaggedDeleteInvoice>

export const InvoiceActions = Sc.Union(
  TaggedDeleteInvoice,
  TaggedUpdateInvoice,
  TaggedCreateInvoice
)

export type InvoiceActions = typeof InvoiceActions.Type
