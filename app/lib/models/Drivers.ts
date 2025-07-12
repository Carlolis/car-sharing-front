import { Schema as Sc } from 'effect'

export const Driver = Sc.Literal('maé', 'charles', 'brigitte')

export type Driver = typeof Driver.Type

export const Drivers = Sc.Array(Driver)

export type Drivers = Driver[]
