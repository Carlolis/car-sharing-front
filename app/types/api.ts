import { DateTime, identity, pipe, Schema as Sc } from 'effect'
import { ensure } from 'effect/Array'
import { formatIsoDateUtc } from 'effect/DateTime'
import { Drivers } from '~/lib/models/Drivers'
export interface Trip {
  id: string
  userId: string
  startLocation: string
  endLocation: string
  date: string
  distance: number
  passengers: number
}

const LocalDate = Sc.transform(
  // Source schema: "on" or "off"

  Sc.String,
  // Target schema: boolean

  Sc.DateFromSelf,
  {
    // optional but you get better error messages from TypeScript

    strict: true,

    // Transformation to convert the output of the

    // source schema ("on" | "off") into the input of the

    // target schema (boolean)

    decode: x => Sc.decodeSync(Sc.DateFromString)(x), // Always succeeds here

    // Reverse transformation

    encode: date =>
      pipe(
        date,
        DateTime.unsafeFromDate,
        formatIsoDateUtc
        // formatIso({
        //   year: 'numeric',
        //   day: '2-digit',
        //   month: '2-digit'
        // })
      )
  }
)

const ArrayEnsure = Sc.transform(
  Sc.Union(Sc.String, Drivers),
  Drivers,
  {
    strict: false,
    decode: ensure,
    encode: identity
  }
)

export const TripCreate = Sc.Struct({
  name: Sc.String,
  date: LocalDate,
  distance: Sc.NumberFromString,
  drivers: ArrayEnsure
})

export type TripCreate = Sc.Schema.Type<typeof TripCreate>

export const Username = Sc.Struct({
  username: Sc.String
})

export type Username = Sc.Schema.Type<typeof Username>

export const TripUpdate = Sc.Struct({
  id: Sc.String,
  name: Sc.String,
  date: LocalDate,
  distance: Sc.Number,
  drivers: ArrayEnsure
})

export type TripUpdate = Sc.Schema.Type<typeof TripUpdate>

export const TripStats = Sc.Struct({
  totalKilometers: Sc.Int
})

export type TripStats = Sc.Schema.Type<typeof TripStats>

export interface ErrorResponse {
  message: string
}
