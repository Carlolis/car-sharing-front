import { identity, Schema as Sc } from 'effect'

export const BooleanFromString = Sc.transform(
  Sc.Union(Sc.Literal('true', 'false'), Sc.Boolean),
  Sc.Boolean,
  {
    strict: false,
    decode: x => {
      if (typeof x === 'boolean') return x
      return Sc.decodeSync(Sc.BooleanFromString)(x)
    }, // Always succeeds here
    encode: identity
  }
)
