import { Data } from 'effect'

export class SimpleTaggedError extends Data.TaggedError('SimpleTaggedError')<{ message: string }> {
  static of = (message: string): SimpleTaggedError => new SimpleTaggedError({ message })
}
