import { Schema as Sc } from 'effect'
import { DriversArrayEnsure, LocalDate } from './api'

export const Invoice = Sc.Struct({
  id: Sc.String,
  name: Sc.String,
  amount: Sc.Number,
  date: LocalDate,
  mileage: Sc.optional(Sc.Union(Sc.Number, Sc.NumberFromString)),
  kind: Sc.String,
  drivers: DriversArrayEnsure,
  fileName: Sc.optional(Sc.String),
  downloadUrl: Sc.optional(Sc.String)
})

export type Invoice = Sc.Schema.Type<typeof Invoice>
