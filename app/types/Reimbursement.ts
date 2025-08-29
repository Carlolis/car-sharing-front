import { Schema as Sc } from 'effect'

export const DriverName = Sc.String

export const Reimbursement = Sc.Struct({
  driverName: DriverName,
  totalAmount: Sc.Number,
  to: Sc.Record({ key: DriverName, value: Sc.Number })
})

export type Reimbursement = Sc.Schema.Type<typeof Reimbursement>
