import { Schema as Sc } from 'effect'
import { Uint8Array } from 'effect/Schema'
import { DriversArrayEnsure, LocalDate } from './api'

export const InvoiceUpdate = Sc.Struct({
  id: Sc.UUID,
  name: Sc.String,
  date: LocalDate,
  mileage: Sc.String,
  amount: Sc.NumberFromString,
  drivers: DriversArrayEnsure,
  fileBytes: Sc.optional(Uint8Array),
  fileName: Sc.optional(Sc.String),
  kind: Sc.String
})

export type InvoiceUpdate = Sc.Schema.Type<typeof InvoiceUpdate>
