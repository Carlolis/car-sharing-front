import { Schema as Sc } from 'effect'

export const NextMaintenance = Sc.Struct({
  type: Sc.String,
  dueMileage: Sc.optional(Sc.Number),
  dueDate: Sc.optional(Sc.DateFromString),
  description: Sc.optional(Sc.String)
})

export type NextMaintenance = Sc.Schema.Type<typeof NextMaintenance>

export const NextMaintenances = Sc.Tuple(
  Sc.Union(NextMaintenance, Sc.Null),
  Sc.Union(NextMaintenance, Sc.Null)
)

export type NextMaintenances = Sc.Schema.Type<typeof NextMaintenances>
