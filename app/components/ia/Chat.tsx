import * as O from 'effect/Option'
import type React from 'react'
import { FiCommand } from 'react-icons/fi'
import { GiBrain } from 'react-icons/gi'
import { LuLoaderCircle } from 'react-icons/lu'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

interface ChatProps {
  isLoading: boolean
  responses: { question: string; response: O.Option<string> }[]
  selectedModel: string | null
  isWritingResponse: boolean
  chatUuid: string
}

export const Chat: React.FC<ChatProps> = (
  { isLoading, responses, selectedModel, isWritingResponse, chatUuid }
) => (
  <>
    <div className="mt-8 text-center">
      {isLoading ?
        <LuLoaderCircle className="mx-auto my-4 text-indigo-600 animate-spin" size={48} /> :
        <FiCommand className="mx-auto my-4 text-indigo-600" size={48} />}
      {responses.map(({ question, response }, i) => (
        <div
          key={i}
          className="text-lg text-gray-900  p-4 bg-white  rounded-md border border-gray-300  mt-4"
        >
          <div className="flex justify-end mb-4">
            <div className="inline-block py-2 px-3 bg-gray-200  rounded-full">
              {question}
            </div>
          </div>
          <div className="text-left flex items-start">
            <div className="overflow-auto break-words">
              {O.match({
                onNone: () => (
                  <>
                    <LuLoaderCircle className="text-indigo-600 animate-spin m-2" size={24} />
                  </>
                ),
                onSome: (res: string) => (
                  <>
                    <GiBrain className="flex-shrink-0 mr-2 text-indigo-600 mt-1" size={24} />
                    <div className="flex items-end">
                      <div className="w-full">
                        <Markdown
                          components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')

                              return match ?
                                (
                                  <SyntaxHighlighter
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
                      </div>
                      {isWritingResponse && <span className="animate-pulse">...</span>}
                    </div>
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
        id="question"
        name="question"
        type="text"
        required
        className="appearance-none rounded-none w-full px-3 py-2 border border-gray-300  placeholder-gray-500  text-gray-900  bg-white  rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Demandez à l'IA"
      />
      <input
        id="_tag"
        name="_tag"
        type="hidden"
        required
        placeholder="Tag"
        defaultValue={'ask'}
      />
      <input
        id="chatUuid"
        name="chatUuid"
        type="hidden"
        required
        placeholder="chatUuid"
        defaultValue={chatUuid}
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
  </>
)
