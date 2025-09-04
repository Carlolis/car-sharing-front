import { Schema as Sc } from 'effect'
export const NumberFromEmptyString = Sc.transform(
  Sc.String,
  Sc.Number,
  {
    strict: true,
    decode: x => {
      if (x === '') {
        return 0
      }
      return Sc.decodeSync(Sc.NumberFromString)(x)
    }, // Always succeeds here
    encode: number => number.toString()
  }
)
