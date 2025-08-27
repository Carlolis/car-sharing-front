import { Schema as Sc } from 'effect'
import { TripCreate, TripUpdate } from '~/types/api'

export const TaggedUpdateTrip = Sc.TaggedStruct('update', {
  tripUpdate: TripUpdate
})

export const TaggedCreateTrip = Sc.TaggedStruct('create', {
  tripCreate: TripCreate
})
export type TaggedUpdateTrip = Sc.Schema.Type<typeof TaggedUpdateTrip>

export const TaggedDeleteTrip = Sc.TaggedStruct('delete', {
  tripId: Sc.UUID
})
export type TaggedDeleteTrip = Sc.Schema.Type<typeof TaggedDeleteTrip>

export const TripActions = Sc.Union(
  TaggedDeleteTrip,
  TaggedUpdateTrip,
  TaggedCreateTrip
)

export type TripActions = typeof TripActions.Type
