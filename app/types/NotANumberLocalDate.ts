import { DateTime, pipe, Schema as Sc } from 'effect'
import { formatIsoDateUtc } from 'effect/DateTime'
import * as O from 'effect/Option'

export const NotANumberToOptionalLocalDate = Sc.transform(
  Sc.Any,
  Sc.Union(Sc.DateFromSelf, Sc.Undefined),
  {
    strict: true,
    decode: x => {
      if (x instanceof Date) {
        return x
      }
      if (x === '') {
        return undefined
      }
      if (typeof x === 'string') {
        return Sc.decodeSync(Sc.DateFromString)(x)
      }
      return undefined
    }, // Always succeeds here
    encode: date =>
      pipe(
        date,
        O.fromNullable,
        O.map(DateTime.unsafeFromDate),
        O.map(formatIsoDateUtc),
        O.getOrElse(() => undefined)
      )
  }
)
