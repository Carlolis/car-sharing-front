import { HttpServerRequest } from '@effect/platform'
import { Config, Match, pipe, Schedule, String } from 'effect'
import * as A from 'effect/Array'
import * as T from 'effect/Effect'
import * as O from 'effect/Option'
import { Unexpected } from 'effect/ParseResult'
import { MessageSquareDiff } from 'lucide-react'
import { Ollama } from 'ollama'
import { useEffect, useState } from 'react'
import { FiCommand } from 'react-icons/fi'
import { LuLoaderCircle } from 'react-icons/lu'
import { Form, useActionData, useLoaderData, useSubmit } from 'react-router'
import { Chat } from '~/components/ia/Chat'
import { Info } from '~/components/ia/Info'

import { ModelSelect } from '~/components/ia/Select'
import type { ChatChunk } from '~/contexts/ia.util'
import { IaService } from '~/contexts/ia.util'
import { IArguments } from '~/lib/models/IA'
import { Remix } from '~/runtime/Remix'
import { ApiService } from '~/services/api'

export const loader = Remix.loader(
  T.gen(function* () {
    const ollamaHost = yield* pipe(
      Config.string('OLLAMA_HOST'),
      Config.withDefault('localhost:11434')
    )

    const isOllamaAvailable = yield* pipe(
      T.tryPromise(
        () => fetch(`http://${ollamaHost}`)
      ),
      T.flatMap(response => T.tryPromise(() => (response.text()))),
      T.tap(response => T.logInfo('Remix loader', response)),
      T.as(true),
      T.catchAll(() => T.succeed(false))
    )

    return { isOllamaAvailable }
  }).pipe(
    T.scoped,
    T.tapError(T.logError),
    T.catchAll(error => T.fail(new Unexpected(error)))
  )
)

export const action = Remix.action(
  T.gen(function* () {
    const request = yield* HttpServerRequest.schemaBodyForm(IArguments)

    const match = Match.type<IArguments>().pipe(
      Match.tag('wakeUp', () =>
        T.gen(function* () {
          yield* T.logInfo('Waking up Ollama...')
          yield* pipe(
            T.tryPromise(
              {
                try: () =>
                  fetch(`http://192.168.1.101:3333`, {
                    method: 'POST',
                    body: 'ertttyujivovpvlghl'
                  }),
                catch: error => {
                  // eslint-disable-next-line no-console
                  console.error(error)
                  return T.fail(error)
                }
              }
            )
          )

          const ollamaHost = yield* pipe(
            Config.string('OLLAMA_HOST'),
            Config.withDefault('localhost:11434')
          )
          yield* T.logInfo(`Ollama Host: ${ollamaHost}`)

          const task = pipe(
            T.tryPromise(
              {
                try: () => fetch(`http://${ollamaHost}`),
                catch: error => {
                  // eslint-disable-next-line no-console
                  console.error(error)
                  return T.fail(error)
                }
              }
            ),
            T.tapError(response => T.logInfo('Ollama response error', response)),
            T.as(true),
            T.catchAll(() => T.succeed(false))
          )
          const policy = Schedule.fixed('500 millis')
          yield* T.repeat(task, {
            schedule: policy,
            until: isOllamaAvailable => isOllamaAvailable
          })

          yield* T.logInfo('Ollama is awake!')
          return true
        })),
      Match.tag('ask', ({ question, model, chatUuid }) =>
        T.gen(function* () {
          const ollamaHost = yield* pipe(
            Config.string('OLLAMA_HOST'),
            Config.withDefault('localhost:11434')
          )

          yield* T.logInfo(`Ollama Host: ${ollamaHost}`)
          yield* T.logInfo(`Ollama Model: ${model}`)

          const ollama = new Ollama({
            host: ollamaHost
          })
          const iaService = yield* IaService

          const chatResponse = yield* pipe(
            T.promise(() =>
              ollama.chat({
                model,
                messages: [{ content: question, role: 'user' }],
                stream: true
              })
            ),
            T.flatMap(ollamaResponse =>
              iaService.streamEffectResponse(ollamaResponse, chatUuid, question)
            )
          )

          return T.runPromise(chatResponse)
        })),
      Match.tag('newChat', ({ name }) =>
        T.gen(function* () {
          const api = yield* ApiService
          const chatUuid = yield* api.createChat('da57890c-ed4f-11ef-ade3-1f987dffad35', name)

          return chatUuid
        })),
      Match.exhaustive
    )
    const response = yield* match(request)

    return { response }
  }).pipe(
    T.scoped,
    T.tapError(T.logError),
    T.catchAll(error => T.fail(new Unexpected(error)))
  )
)

export default function IA() {
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()
  const { isOllamaAvailable } = useLoaderData<typeof loader>()

  const [isChatReady, setIsChatReady] = useState<boolean>(isOllamaAvailable)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [responses, setAIResponses] = useState<{ response: O.Option<string>; question: string }[]>(
    []
  )
  const [currentChatUuid, setCurrentChatUuid] = useState<O.Option<string>>(O.none())

  const [isWritingResponse, setIsWritingResponse] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<{ title: string; chatUuid: string }[]>([])

  useEffect(() => {
    if (actionData) {
      const match = Match.type<typeof actionData.response>().pipe(
        Match.when(Match.boolean, () => {
          setIsLoading(false)
          setIsChatReady(true)
        }),
        Match.when(Match.string, chatUuid => {
          setIsLoading(false)
          setIsChatReady(true)
          setCurrentChatUuid(O.some(chatUuid))
        }),
        Match.orElse(async response => {
          const handleChatChunk = (chat: ChatChunk) => {
            if (chat.type === 'text') {
              setIsWritingResponse(true)

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

            const isEquivalent = O.getEquivalence(String.Equivalence)
            const lastChatUuid = pipe(
              A.last(chatHistory),
              O.map(({ chatUuid }) => chatUuid)
            )
            const isNewChat = isEquivalent(lastChatUuid, currentChatUuid)

            if (chat.type === 'done' && isNewChat) {
              pipe(
                A.last(responses),
                O.flatMap(
                  ({ question }) => O.all({ currentChatUuid, question: O.some(question) })
                ),
                O.map(
                  (
                    { question, currentChatUuid }
                  ) => (setChatHistory(
                    history => [...history, { title: question, chatUuid: currentChatUuid }]
                  ))
                )
              )

              setIsWritingResponse(false)
            }
          }
          const chatResponse = await response
          handleChatChunk(chatResponse)
        })
      )
      match(actionData.response)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData])

  return (
    <>
      {isChatReady ?
        (
          <div className="flex bg-white dark:bg-gray-900 space-x-4">
            <div className="min-h-screen w-1/4 p-4 bg-gray-100 dark:bg-gray-800 h-full border-r border-gray-300 dark:border-gray-700 flex flex-col">
              <div>
                <button
                  className="bg-white text-blue-500 px-4 py-1 rounded my-2 flex items-center space-x-2 hover:bg-blue-500 hover:text-white transition-colors duration-300"
                  onClick={() => {
                    setChatHistory([])

                    const formData = new FormData()
                    formData.append('_tag', 'newChat')
                    formData.append('name', 'Nouveau Chat')
                    submit(formData, {
                      method: 'POST'
                    })
                  }}
                >
                  <MessageSquareDiff className="w-5 h-5" />
                  <div>Nouveau Chat</div>
                </button>
              </div>

              <ul className=" space-y-2 flex-grow overflow-y-auto">
                {chatHistory.map((chat, index) => (
                  <li key={index} className="p-2 bg-white dark:bg-gray-700 rounded">
                    <p className="font-bold">{chat.title}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-3/4  space-y-8 p-16">
              <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                  Demandez à l&apos;IA
                </h2>
              </div>
              {O.isSome(currentChatUuid) && (
                <Form
                  className="mt-8 space-y-6"
                  method="post"
                  onSubmit={event => {
                    const form = event.currentTarget

                    const question =
                      (form.elements.namedItem('question') as HTMLTextAreaElement).value

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
                    isWritingResponse={isWritingResponse}
                    chatUuid={currentChatUuid.value}
                  />
                </Form>
              )}
              <Info />
            </div>
          </div>
        ) :
        (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            {isLoading ?
              <LuLoaderCircle className="mx-auto my-4 text-indigo-600 animate-spin" size={48} /> :
              <FiCommand className="mx-auto my-4 text-indigo-600" size={48} />}
            {isLoading ? null : (
              <button
                onClick={() => {
                  setIsLoading(true)
                  const formData = new FormData()
                  formData.append('_tag', 'wakeUp')

                  submit(formData, {
                    method: 'POST'
                  })
                }}
                className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out"
              >
                <h1 className="text-4xl font-bold text-white">
                  Réveiller le chat !
                </h1>
              </button>
            )}
          </div>
        )}
    </>
  )
}
