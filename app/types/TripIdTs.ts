import { Schema as Sc } from 'effect'

export const TaggedTripId = Sc.TaggedStruct('TripId', {
  tripId: Sc.String
})
