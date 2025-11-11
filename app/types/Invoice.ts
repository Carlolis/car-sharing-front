import { Schema as Sc } from 'effect'
import { FormattedLocalDate } from './FormattedLocalDate'

export const InvoiceKinds = Sc.Literal(
  'Carburant',
  'Entretien',
  'Assurance',
  'Réparation',
  'Contrôle technique',
  'Autre',
  'Remboursement',
  'Péage'
)

export type InvoiceKind = Sc.Schema.Type<typeof InvoiceKinds>

export const Invoice = Sc.Struct({
  id: Sc.String,
  name: Sc.String,
  amount: Sc.Number,
  date: FormattedLocalDate,
  mileage: Sc.optional(Sc.Union(Sc.Number, Sc.NumberFromString)),
  kind: InvoiceKinds,
  driver: Sc.String,
  fileName: Sc.optional(Sc.String),
  toDriver: Sc.optional(Sc.String)
})

export type Invoice = Sc.Schema.Type<typeof Invoice>
