import { Schema as Sc } from 'effect'
import { Uint8Array } from 'effect/Schema'
import { FormattedLocalDate } from './FormattedLocalDate'

export const InvoiceCreate = Sc.Struct({
  name: Sc.String,
  date: FormattedLocalDate,
  mileage: Sc.String,
  amount: Sc.NumberFromString,
  driver: Sc.String,
  fileBytes: Sc.optional(Uint8Array),
  fileName: Sc.optional(Sc.String),
  kind: Sc.String,
  toDriver: Sc.optional(Sc.String)
})

export type InvoiceCreate = Sc.Schema.Type<typeof InvoiceCreate>
