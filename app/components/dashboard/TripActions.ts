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

export const TaggedCalculateDistance = Sc.TaggedStruct('distance', {
  from: Sc.String,
  to: Sc.String
})
export type TaggedCalculateDistance = Sc.Schema.Type<typeof TaggedCalculateDistance>

export const TaggedFindCities = Sc.TaggedStruct('city', {
  city: Sc.String
})
export type TaggedFindCities = Sc.Schema.Type<typeof TaggedFindCities>

export const TripActions = Sc.Union(
  TaggedDeleteTrip,
  TaggedUpdateTrip,
  TaggedCreateTrip,
  TaggedCalculateDistance,
  TaggedFindCities
)

export type TripActions = typeof TripActions.Type
