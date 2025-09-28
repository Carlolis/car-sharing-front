import { Schema as S } from 'effect'

export const Car = S.Struct({
  id: S.String,
  name: S.String,
  mileage: S.Number
})

export type Car = S.Schema.Type<typeof Car>
