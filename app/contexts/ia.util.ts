import type { HttpClient } from '@effect/platform'
import { FetchHttpClient } from '@effect/platform'
import { Deferred, pipe, type Scope } from 'effect'
import * as T from 'effect/Effect'
import * as L from 'effect/Layer'
import type { ChatResponse } from 'ollama'
import { ConfigLive } from '~/runtime/Config'
import { ApiService } from '~/services/api'
import { transformIterable } from './transformIterable'

export type ChatChunk =
  | { type: 'done' }
  | { type: 'error'; reason: unknown }
  | {
    type: 'text'
    content: string
    next: Promise<ChatChunk> | null
  }

// export async function streamResponse(
//   response: AsyncIterable<ChatResponse>,
//   chatUuid: string
// ): Promise<ChatChunk> {
//   let content = ''
//   let firstChunkContent = ''
//   const iterable = response[Symbol.asyncIterator]()
//   try {
//     const firstChunk = await iterable.next()
//     if (firstChunk.done || firstChunk.value.done) {
//       return { type: 'done' }
//     }
//     firstChunkContent = firstChunk.value.message.content ?? ''

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     content += firstChunkContent
//   } catch (reason) {
//     return { type: 'error', reason }
//   }

//   let next = new Deferred<ChatChunk>()
//   const firstPromise = next.promise
//   ;(async () => {
//     try {
//       do {
//         const chunk = await iterable.next()
//         if (chunk.done || chunk.value.done) {
//           next.resolve({ type: 'done' })
//           return
//         }
//         const nextNext = new Deferred<ChatChunk>()
//         const chunkContent = chunk.value.message.content ?? ''
//         content += chunkContent

//         next.resolve({
//           type: 'text',
//           content: chunkContent,
//           next: nextNext.promise
//         })
//         next = nextNext
//         // eslint-disable-next-line no-constant-condition
//       } while (true)
//     } catch (reason) {
//       next.resolve({ type: 'error', reason })
//     }
//   })()

//   return {
//     type: 'text',
//     content: firstChunkContent,
//     next: firstPromise
//   }
// }

export class IaService extends T.Service<IaService>()('IaService', {
  effect: T.gen(function* () {
    const api = yield* ApiService
    const streamEffectResponse = (
      response: AsyncIterable<ChatResponse>,
      chatUuid: string,
      question: string
    ): T.Effect<T.Effect<ChatChunk>, never, ApiService | HttpClient.HttpClient | Scope.Scope> =>
      T.gen(function* () {
        let content = ''
        let firstChunkContent = ''
        const iterable = response[Symbol.asyncIterator]()

        const firstChunk = yield* T.tryPromise({
          try: () => iterable.next(),
          catch: reason => ({ type: 'error' as const, reason })
        })
        yield* T.log('TEXT', firstChunk)
        if (firstChunk.done || firstChunk.value.done) {
          yield* T.log('DONE')
          yield* T.log(content)
          yield* api.addMessageToChat(chatUuid, { question, answer: content })
          // @effect-diagnostics-next-line returnEffectInGen:off
          return T.succeed({ type: 'done' as const })
        }
        firstChunkContent = firstChunk.value.message.content ?? ''

        content += firstChunkContent

        const next = yield* Deferred.make<ChatChunk>()
        const firstPromise = T.runPromise(Deferred.await(next))
        const layers = pipe(
          ApiService.Default,
          L.provide(
            FetchHttpClient.layer
          ),
          L.provide(ConfigLive)
        )
        pipe(
          transformIterable(iterable, next, chatUuid, question, firstChunkContent),
          T.provide(layers),
          T.runPromise
        )
        // ;(async () => {
        //   try {
        //     do {
        //       const chunk = await iterable.next()
        //       if (chunk.done || chunk.value.done) {
        //         next.resolve({ type: 'done' as const })

        //         return
        //       }
        //       const nextNext = new Deferred<ChatChunk>()
        //       const chunkContent = chunk.value.message.content ?? ''
        //       content += chunkContent

        //       next.resolve({
        //         type: 'text' as const,
        //         content: chunkContent,
        //         next: nextNext.promise
        //       })
        //       next = nextNext
        //       // eslint-disable-next-line no-constant-condition
        //     } while (true)
        //   } catch (reason) {
        //     next.resolve({ type: 'error', reason })
        //   }
        // })()

        // @effect-diagnostics-next-line returnEffectInGen:off
        return T.succeed({
          type: 'text' as const,
          content: firstChunkContent,
          next: firstPromise
        })
      }).pipe(
        T.catchAll(reason => T.succeed(T.succeed({ type: 'error' as const, reason })))
      )
    return ({
      streamEffectResponse
    })
  })
}) {}

export const IaServiceLayer = IaService.Default
