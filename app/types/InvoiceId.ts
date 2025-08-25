import { Schema as Sc } from 'effect'

export const TaggedInvoiceId = Sc.TaggedStruct('InvoiceId', {
  invoiceId: Sc.String
})
