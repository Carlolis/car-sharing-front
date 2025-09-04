import { Schema as Sc } from 'effect'
import { BooleanFromString } from './BooleanFromString'
import { FormattedLocalDate } from './FormattedLocalDate'

export const MaintenanceCreate = Sc.Struct({
  type: Sc.String,
  isCompleted: BooleanFromString,
  dueMileage: Sc.optional(Sc.NumberFromString),
  dueDate: Sc.optional(FormattedLocalDate),
  completedDate: Sc.optional(FormattedLocalDate),
  completedMileage: Sc.optional(Sc.NumberFromString),
  description: Sc.optional(Sc.String),
  invoiceId: Sc.optional(Sc.String)
})

export type MaintenanceCreate = Sc.Schema.Type<typeof MaintenanceCreate>
