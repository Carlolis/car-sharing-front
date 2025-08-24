import { Schema as Sc } from 'effect'
import { Uint8Array } from 'effect/Schema'
import { DriversArrayEnsure, LocalDate } from './api'

export const InvoiceCreate = Sc.Struct({
  name: Sc.String,
  date: LocalDate,
  mileage: Sc.NumberFromString,
  amount: Sc.NumberFromString,
  drivers: DriversArrayEnsure,
  fileBytes: Sc.optional(Uint8Array),
  fileName: Sc.optional(Sc.String),
  kind: Sc.String
})

export type InvoiceCreate = Sc.Schema.Type<typeof InvoiceCreate>
