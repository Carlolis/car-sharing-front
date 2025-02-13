import type { ChatResponse } from 'ollama'

export type ChatChunk =
  | { type: 'done' }
  | { type: 'error'; reason: unknown }
  | {
    type: 'text'
    content: string
    next: Promise<ChatChunk> | null
  }

export async function streamResponse(
  response: AsyncIterable<ChatResponse>
): Promise<ChatChunk> {
  let content = ''
  let firstChunkContent = ''
  const iterable = response[Symbol.asyncIterator]()
  try {
    const firstChunk = await iterable.next()
    if (firstChunk.done || firstChunk.value.done) {
      return { type: 'done' }
    }
    firstChunkContent = firstChunk.value.message.content ?? ''

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    content += firstChunkContent
  } catch (reason) {
    return { type: 'error', reason }
  }

  let next = new Deferred<ChatChunk>()
  const firstPromise = next.promise
  ;(async () => {
    try {
      do {
        const chunk = await iterable.next()
        if (chunk.done || chunk.value.done) {
          next.resolve({ type: 'done' })
          return
        }
        const nextNext = new Deferred<ChatChunk>()
        const chunkContent = chunk.value.message.content ?? ''
        content += chunkContent

        next.resolve({
          type: 'text',
          content: chunkContent,
          next: nextNext.promise
        })
        next = nextNext
        // eslint-disable-next-line no-constant-condition
      } while (true)
    } catch (reason) {
      next.resolve({ type: 'error', reason })
    }
  })()

  return {
    type: 'text',
    content: firstChunkContent,
    next: firstPromise
  }
}

class Deferred<T,> {
  promise: Promise<T>

  resolve!: (value: T) => void

  reject!: (reason?: unknown) => void
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
