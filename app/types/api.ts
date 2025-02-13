import { DateTime, identity, pipe, Schema as Sc } from 'effect'
import { ensure } from 'effect/Array'
import { formatIsoDateUtc } from 'effect/DateTime'

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
  Sc.Union(Sc.String, Sc.Array(Sc.String)),
  Sc.Array(Sc.String),
  {
    strict: true,
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

export interface TripStats {
  trips: {
    id: string
    distance: number
    date: string
    name: string
    drivers: {
      name: string
    }[]
  }[]
  totalKilometers: number
}

export interface ErrorResponse {
  message: string
}
