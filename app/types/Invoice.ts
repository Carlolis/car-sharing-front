import { Schema as Sc } from 'effect'
import { LocalDate } from './api'

export const Invoice = Sc.Struct({
  id: Sc.String,
  name: Sc.String,
  amount: Sc.Number,
  date: LocalDate,
  mileage: Sc.optional(Sc.Union(Sc.Number, Sc.NumberFromString)),
  kind: Sc.String,
  driver: Sc.String,
  fileName: Sc.optional(Sc.String),
  toDriver: Sc.optional(Sc.String)
})

export type Invoice = Sc.Schema.Type<typeof Invoice>
