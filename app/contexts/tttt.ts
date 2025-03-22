import * as Deferred from 'effect/Deferred'
import * as Effect from 'effect/Effect'
import * as Ref from 'effect/Ref'

import { pipe } from 'effect'
import type { ChatResponse } from 'ollama'
import { ApiService } from '~/services/api'
import type { ChatChunk } from './ia.util'

export function transformIterable(
  iterable: AsyncIterator<ChatResponse, unknown, unknown>,
  next: Deferred.Deferred<ChatChunk>,
  chatUuid: string,
  question: string,
  firstChunkContent: string
): Effect.Effect<void, never, ApiService> {
  return Effect.gen(function* () {
    // const nextDeferred = yield* (Deferred.make<ChatChunk>())
    const api = yield* (ApiService)
    const contentRef = yield* Ref.make('')

    yield* (Effect.async(_ => {
      const loop = Effect.gen(function* () {
        while (true) {
          const chunkResult = yield* (Effect.promise(() => iterable.next()))

          if (chunkResult.done || chunkResult.value.done) {
            yield* (Deferred.succeed(next, { type: 'done' as const }))
            const currentContent = yield* (Ref.get(contentRef))
            yield* (api.addMessageToChat(chatUuid, {
              question,
              answer: firstChunkContent + currentContent
            }))
            return
          }

          const chunk = chunkResult.value

          if (chunk.done) {
            yield* (Deferred.succeed(next, { type: 'done' as const }))
            return
          }

          const chunkContent = chunk.message.content ?? ''
          const currentContent = yield* (Ref.get(contentRef))
          yield* (Ref.set(contentRef, currentContent + chunkContent))

          const nextNextDeferred = yield* (Deferred.make<ChatChunk>())

          yield* (Deferred.succeed(next, {
            type: 'text' as const,
            content: chunkContent,
            next: Effect.runPromise(Deferred.await(nextNextDeferred))
          }))

          next = nextNextDeferred
        }
      })

      pipe(loop, Effect.runPromise)
        .then(() => {
          // No need to resume here, as the loop completes with a return
        })
        .catch(reason => {
          Effect.runPromise(Deferred.succeed(next, { type: 'error', reason }))
        })
    }))
  })
}
