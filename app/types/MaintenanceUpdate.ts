import { Schema as Sc } from 'effect'

import { BooleanFromString } from './BooleanFromString'
import { NotANumberToOptionalLocalDate } from './NotANumberLocalDate'

export const MaintenanceUpdate = Sc.Struct({
  id: Sc.String,
  type: Sc.String,
  isCompleted: BooleanFromString,
  dueMileage: Sc.optional(Sc.Number),
  dueDate: Sc.optional(NotANumberToOptionalLocalDate),
  completedDate: Sc.optional(NotANumberToOptionalLocalDate),
  completedMileage: Sc.optional(Sc.Number),
  description: Sc.optional(Sc.String),
  invoiceId: Sc.optional(Sc.String)
})

export type MaintenanceUpdate = Sc.Schema.Type<typeof MaintenanceUpdate>
