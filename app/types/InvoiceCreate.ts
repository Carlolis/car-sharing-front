import { Schema as Sc } from 'effect'
import { DriversArrayEnsure, LocalDate } from './api'

export const InvoiceCreate = Sc.Struct({
  name: Sc.String,
  date: LocalDate,
  distance: Sc.NumberFromString,
  drivers: DriversArrayEnsure,
  fileBytes: Sc.optional(Sc.String)
})

export type InvoiceCreate = Sc.Schema.Type<typeof InvoiceCreate>
