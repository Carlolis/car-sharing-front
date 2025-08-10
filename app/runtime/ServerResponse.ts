import { Data } from 'effect'
import type { ParseIssue } from 'effect/ParseResult'
import { NotAuthenticated } from './errors/NotAuthenticatedError'

export interface FormErrorValue {
  values: unknown
  errors: Record<string, { message: string; type: ParseIssue['_tag'] }>
}

export class FormError extends Data.TaggedError('FormError')<FormErrorValue> {}

export class Redirect extends Data.TaggedError('Redirect')<
  { location: string; headers?: { 'Set-Cookie': string }; message?: string }
> {}

export class NotFound extends Data.TaggedError('NotFound')<{
  message: string
}> {}

export class Unexpected extends Data.TaggedError('Unexpected')<{ error: string }> {}

export const ServerResponse = {
  FormError: (params: FormErrorValue) => new FormError(params),
  FormRootError: (message: string) =>
    new FormError({ errors: { root: { type: 'Type', message } }, values: {} }),
  Unexpected: <E extends { _tag: string },>(e: E) => new Unexpected({ error: e._tag }),
  NotFound: (message: string) => new NotFound({ message }),
  Redirect: (p: { location: string; headers?: { 'Set-Cookie': string } }) =>
    new Redirect({ location: p.location, headers: p.headers }),
  NotAuthenticated: (message: string) => NotAuthenticated.of(message)
}
