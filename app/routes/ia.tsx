import { HttpServerRequest } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'
import * as A from 'effect/Array'
import * as T from 'effect/Effect'
import * as O from 'effect/Option'
import { Unexpected } from 'effect/ParseResult'
import { Ollama } from 'ollama'
import { useEffect, useState } from 'react'
import { FaCircle } from 'react-icons/fa'
import { FiCommand } from 'react-icons/fi'
import { GiBrain } from 'react-icons/gi'
import { LuLoaderCircle } from 'react-icons/lu'
import { MdOutlineGppBad } from 'react-icons/md'
import Markdown from 'react-markdown'
import { Form, useActionData } from 'react-router'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

import { ChatChunk, streamResponse } from '~/contexts/ia.util'
import { Remix } from '~/runtime/Remix'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'

export const action = Remix.action(
  T.gen(function* () {
    const { message, model } = yield* HttpServerRequest.schemaBodyForm(
      Sc.Struct({
        message: Sc.String,
        model: Sc.String
      })
    )

    const ollama = new Ollama({
      host: process.env.OLLAMA_HOST
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

  useEffect(() => {
    if (actionData) {
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
              form.reset()
            })
          }}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Select
                  name="model"
                  onValueChange={value => setSelectedModel(value)}
                >
                  <SelectTrigger
                    id="model"
                    name="model"
                    className="dark:bg-gray-800 dark:text-white bg-white"
                  >
                    <SelectValue placeholder="Choisi un modèle" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white">
                    <SelectItem value="codestral:latest">
                      <FaCircle className="inline-block mr-1 text-green-600" />
                      🇫🇷 Mistral Codestral Latest
                    </SelectItem>
                    <SelectItem value="mistral-small:24b">
                      <FaCircle className="inline-block mr-1 text-yellow-600" />
                      🇫🇷 Mistral Small 3 24B
                    </SelectItem>
                    <SelectItem value="milkey/Simplescaling-S1:latest">
                      <div>
                        <FaCircle className="inline-block mr-1 text-red-600" />
                        <GiBrain className="inline-block mr-1 text-purple-600" />
                        🇺🇸 Simplescaling S1
                      </div>
                    </SelectItem>
                    <SelectItem value="deepseek-coder-v2:latest">
                      <div>
                        <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
                        <FaCircle className="inline-block mr-1 text-green-600" />
                        🇨🇳 DeepSeek Coder V2 Latest
                      </div>
                    </SelectItem>
                    <SelectItem value="deepseek-r1:32b-qwen-distill-q4_K_M">
                      <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
                      <FaCircle className="inline-block mr-1 text-red-600" />
                      <GiBrain className="inline-block mr-1 text-purple-600" />
                      🇨🇳 DeepSeek R1 32B Distill
                    </SelectItem>
                    <SelectItem value="deepseek-r1:14b-qwen-distill-q4_K_M">
                      <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
                      <FaCircle className="inline-block mr-1 text-green-600" />
                      <GiBrain className="inline-block mr-1 text-purple-600" />
                      🇨🇳 DeepSeek R1 14B Distill
                    </SelectItem>
                    <SelectItem value="deepseek-r1:latest">
                      <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
                      <FaCircle className="inline-block mr-1 text-blue-600" />
                      <GiBrain className="inline-block mr-1 text-purple-600" />
                      🇨🇳 DeepSeek R1 Latest
                    </SelectItem>
                    <SelectItem value="llama3.1:8b">
                      <FaCircle className="inline-block mr-1 text-blue-600" />
                      🇺🇸 Llama 3.1 8b
                    </SelectItem>
                    <SelectItem value="llama3.2:3b">
                      <FaCircle className="inline-block mr-1 text-blue-600" />
                      🇺🇸 Llama 3.2 3b
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            {isLoading ?
              <LuLoaderCircle className="mx-auto my-4 text-indigo-600 animate-spin" size={48} /> :
              <FiCommand className="mx-auto my-4 text-indigo-600" size={48} />}
            {responses.map(({ question, response }, i) => (
              <div
                key={i}
                className="text-lg text-gray-900 dark:text-white p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 mt-4"
              >
                <div className="flex justify-end mb-4">
                  <div className="inline-block py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                    {question}
                  </div>
                </div>
                <div className="text-left flex items-start">
                  <div className="overflow-auto break-words">
                    {O.match({
                      onNone: () => (
                        <>
                          <LuLoaderCircle className="text-indigo-600 animate-spin" size={24} />
                        </>
                      ),
                      onSome: (res: string) => (
                        <>
                          <GiBrain className="flex-shrink-0 mr-2 text-indigo-600 mt-1" size={24} />
                          <Markdown
                            components={{
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '')

                                return match ?
                                  (
                                    <SyntaxHighlighter
                                      style={atomOneDark}
                                      language={match[1]}
                                      PreTag="div"
                                    >
                                      {String(children)}
                                    </SyntaxHighlighter>
                                  ) :
                                  (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  )
                              }
                            }}
                          >
                            {res}
                          </Markdown>
                        </>
                      )
                    })(response)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              id="message"
              name="message"
              type="text"
              required
              className="appearance-none rounded-none w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Demandez à l'IA"
            />
            <button
              type="submit"
              className={`px-4 py-2 flex items-center justify-center text-white ${
                selectedModel ?
                  'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' :
                  'bg-gray-400 cursor-not-allowed'
              } rounded-r-md`}
              disabled={!selectedModel}
            >
              <GiBrain size={20} />
            </button>
          </div>
        </Form>
        <div className="mt-8 text-left">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-md border border-gray-300 dark:border-gray-600">
            <h3 className="text-md text-gray-900 dark:text-white">
              Rapidité des modèles
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
              <li>
                <FaCircle className="inline-block mr-1 text-red-600" /> très lent
              </li>
              <li>
                <FaCircle className="inline-block mr-1 text-yellow-600" /> lent
              </li>
              <li>
                <FaCircle className="inline-block mr-1 text-green-600" /> rapide
              </li>
              <li>
                <FaCircle className="inline-block mr-1 text-blue-600" /> très rapide
              </li>
            </ul>
            <div className="text-sm text-gray-900 dark:text-white">
              À la première exécution, le lancement peut être lent.
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-md border border-gray-300 dark:border-gray-600 mt-4">
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
              <li>
                <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
                Modèle censuré. Exemple: Tiananmen en 1989.
              </li>
              <li>
                <GiBrain className="inline-block mr-1 text-purple-600" />{' '}
                Modèle de Raisonnement Avancé (SRA)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
