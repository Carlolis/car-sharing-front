import { Schema as Sc } from 'effect'
import { TripUpdate } from '~/types/api'

export const TaggedUpdateTrip = Sc.TaggedStruct('update', {
  tripUpdate: TripUpdate
})

export type TaggedUpdateTrip = Sc.Schema.Type<typeof TaggedUpdateTrip>

export const TaggedDeleteTrip = Sc.TaggedStruct('delete', {
  tripId: Sc.UUID
})
export type TaggedDeleteTrip = Sc.Schema.Type<typeof TaggedDeleteTrip>

export const DashboardArguments = Sc.Union(
  TaggedDeleteTrip,
  TaggedUpdateTrip
)

export type DashboardArguments = typeof DashboardArguments.Type
