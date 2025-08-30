import { Schema as Sc } from 'effect'
import { Uint8Array } from 'effect/Schema'
import { LocalDate } from './api'

export const InvoiceUpdate = Sc.Struct({
  id: Sc.UUID,
  name: Sc.String,
  date: LocalDate,
  mileage: Sc.String,
  amount: Sc.NumberFromString,
  driver: Sc.String,
  fileBytes: Sc.optional(Uint8Array),
  fileName: Sc.optional(Sc.String),
  kind: Sc.String,
  isReimbursement: Sc.Boolean,
  toDriver: Sc.optional(Sc.String)
})

export type InvoiceUpdate = Sc.Schema.Type<typeof InvoiceUpdate>
