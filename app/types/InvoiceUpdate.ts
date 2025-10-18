import { Schema as Sc } from 'effect'
import { Uint8Array } from 'effect/Schema'
import { FormattedLocalDate } from './FormattedLocalDate'
import { InvoiceKinds } from './Invoice'

export const InvoiceUpdate = Sc.Struct({
  id: Sc.UUID,
  name: Sc.String,
  date: FormattedLocalDate,
  mileage: Sc.String,
  amount: Sc.NumberFromString,
  driver: Sc.String,
  fileBytes: Sc.optional(Uint8Array),
  fileName: Sc.optional(Sc.String),
  kind: InvoiceKinds,
  toDriver: Sc.optional(Sc.String)
})

export type InvoiceUpdate = Sc.Schema.Type<typeof InvoiceUpdate>
