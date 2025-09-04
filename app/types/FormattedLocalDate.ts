import { DateTime, pipe, Schema as Sc } from 'effect'
import { formatIsoDateUtc } from 'effect/DateTime'

export const FormattedLocalDate = Sc.transform(
  Sc.String,
  Sc.DateFromSelf,
  {
    strict: true,
    decode: x => Sc.decodeSync(Sc.DateFromString)(x), // Always succeeds here
    encode: date =>
      pipe(
        date,
        DateTime.unsafeFromDate,
        formatIsoDateUtc
      )
  }
)
