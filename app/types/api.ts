import { identity, Schema as Sc } from 'effect'
import { ensure } from 'effect/Array'
import { Drivers } from '~/lib/models/Drivers'
import { FormattedLocalDate } from './FormattedLocalDate'

export const DriversArrayEnsure = Sc.transform(
  Sc.Union(Sc.String, Drivers),
  Drivers,
  {
    strict: false,
    decode: ensure,
    encode: identity
  }
).annotations({
  message: () => 'Veuillez entrer une date.',
  override: true
})

export const OptionalNumberFromString = Sc.optional(Sc.NumberFromString)

export const TripCreate = Sc.Struct({
  name: Sc.String,
  startDate: FormattedLocalDate,
  endDate: FormattedLocalDate,
  distance: OptionalNumberFromString,
  drivers: DriversArrayEnsure,
  comments: Sc.optional(Sc.String)
})

export type TripCreate = Sc.Schema.Type<typeof TripCreate>

export const Username = Sc.Struct({
  username: Sc.String
})

export type Username = Sc.Schema.Type<typeof Username>

export const TripUpdate = Sc.Struct({
  id: Sc.String,
  name: Sc.String,
  startDate: FormattedLocalDate,
  endDate: FormattedLocalDate,
  distance: Sc.optional(Sc.Number),
  drivers: DriversArrayEnsure,
  comments: Sc.optional(Sc.String)
})

export type TripUpdate = Sc.Schema.Type<typeof TripUpdate>

export const TripStats = Sc.Struct({
  totalKilometers: Sc.Int
})

export type TripStats = Sc.Schema.Type<typeof TripStats>

export interface ErrorResponse {
  message: string
}
