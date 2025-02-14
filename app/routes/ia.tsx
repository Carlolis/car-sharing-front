import { HttpServerRequest } from '@effect/platform'
import { Config, pipe, Schema as Sc } from 'effect'
import * as A from 'effect/Array'
import * as T from 'effect/Effect'
import * as O from 'effect/Option'
import { Unexpected } from 'effect/ParseResult'
import { Ollama } from 'ollama'
import { useEffect, useState } from 'react'
import { Form, useActionData } from 'react-router'
import { Chat } from '~/components/ia/Chat'
import { Info } from '~/components/ia/Info'

import { ModelSelect } from '~/components/ia/Select'
import type { ChatChunk } from '~/contexts/ia.util'
import { streamResponse } from '~/contexts/ia.util'
import { Remix } from '~/runtime/Remix'

export const action = Remix.action(
  T.gen(function* () {
    const { message, model } = yield* HttpServerRequest.schemaBodyForm(
      Sc.Struct({
        message: Sc.String,
        model: Sc.String
      })
    )
    const ollamaHost = yield* pipe(
      Config.string('OLLAMA_HOST'),
      Config.withDefault('localhost:11434')
    )

    yield* T.logInfo(`Ollama Host: ${ollamaHost}`)
    yield* T.logInfo(`Ollama Model: ${model}`)

    const ollama = new Ollama({
      host: ollamaHost
    })

    const chatResponse = yield* pipe(
      T.promise(() =>
        ollama.chat({
          model,
          messages: [{ content: message, role: 'user' }],
          stream: true
        })
      ),
      T.map(streamResponse)
    )

    return chatResponse
  }).pipe(
    T.scoped,
    T.tapError(T.logError),
    T.catchAll(error => T.fail(new Unexpected(error)))
  )
)

export default function IA() {
  const actionData = useActionData<typeof action>()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [responses, setAIResponses] = useState<{ response: O.Option<string>; question: string }[]>(
    []
  )
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  useEffect(() => {
    if (actionData) {
      const handleChatChunk = (chat: ChatChunk) => {
        if (chat.type === 'text') {
          setIsLoading(false)
          setAIResponses(contents => {
            const lastContents: {
              question: string
              response: O.Option<string>
            } = pipe(
              A.last(contents),
              O.map(({ question, response }) => ({
                question,
                response: pipe(
                  response,
                  O.match({
                    onNone: () => O.some(chat.content),
                    onSome: response => O.some(response + chat.content)
                  })
                )
              })),
              O.getOrElse(() => ({ question: '', response: O.none() }))
            )
            const contentsWithoutLast = A.dropRight(contents, 1)

            return [...contentsWithoutLast, lastContents]
          })
          chat.next?.then(nextChat => {
            handleChatChunk(nextChat)
          })
        }
      }
      handleChatChunk(actionData)
    }
  }, [actionData])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Demandez à l&apos;IA
          </h2>
        </div>
        <Form
          className="mt-8 space-y-6"
          method="post"
          onSubmit={event => {
            const form = event.currentTarget

            const question = (form.elements.namedItem('message') as HTMLTextAreaElement).value

            setAIResponses(responses => [...responses, { question, response: O.none() }])
            setIsLoading(true)

            setTimeout(() => {
              const messageInput = form.elements.namedItem('message') as HTMLTextAreaElement
              messageInput.value = ''
            })
          }}
        >
          <ModelSelect setSelectedModel={setSelectedModel} />

          <Chat
            isLoading={isLoading}
            responses={responses}
            selectedModel={selectedModel}
          />
        </Form>
        <Info />
      </div>
    </div>
  )
}
