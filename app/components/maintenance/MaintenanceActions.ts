import { Schema as Sc } from 'effect'
import { NotANumberToOptionalLocalDate } from '~/types/NotANumberLocalDate'
import { NumberFromEmptyString } from '~/types/NumberFromEmptyString'

export const MaintenanceCreateFormTagged = (Sc.Struct({
  type: Sc.String,
  isCompleted: Sc.optional(Sc.BooleanFromString),
  dueMileage: Sc.optional(NumberFromEmptyString),
  dueDate: Sc.optional(NotANumberToOptionalLocalDate),
  completedDate: Sc.optional(NotANumberToOptionalLocalDate),
  completedMileage: Sc.optional(NumberFromEmptyString),
  description: Sc.optional(Sc.String),
  invoiceId: Sc.optional(Sc.String),
  _tag: Sc.Literal('create')
}))

export const MaintenanceUpdateFormTagged = Sc.Struct({
  id: Sc.String,
  type: Sc.String,
  isCompleted: Sc.optional(Sc.BooleanFromString),
  dueMileage: Sc.optional(NumberFromEmptyString),
  dueDate: Sc.optional(NotANumberToOptionalLocalDate),
  completedDate: Sc.optional(NotANumberToOptionalLocalDate),
  completedMileage: Sc.optional(NumberFromEmptyString),
  description: Sc.optional(Sc.String),
  invoiceId: Sc.optional(Sc.String),
  _tag: Sc.Literal('update')
})

export const TaggedDeleteMaintenance = Sc.TaggedStruct('delete', {
  maintenanceId: Sc.UUID
})

export type TaggedDeleteMaintenance = Sc.Schema.Type<typeof TaggedDeleteMaintenance>

export const MaintenanceActions = Sc.Union(
  TaggedDeleteMaintenance,
  MaintenanceUpdateFormTagged,
  MaintenanceCreateFormTagged
)

export type MaintenanceActions = typeof MaintenanceActions.Type
