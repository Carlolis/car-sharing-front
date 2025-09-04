import { Schema as Sc } from 'effect'

export const TaggedMaintenanceId = Sc.TaggedStruct('MaintenanceId', {
  maintenanceId: Sc.String
})