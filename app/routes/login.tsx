import { HttpServerRequest } from '@effect/platform'

import { Match, pipe, Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { useEffect, useState } from 'react'
import { Form, useActionData } from 'react-router'
import { Remix } from '~/runtime/Remix'

import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { SimpleTaggedError } from '~/runtime/errors/SimpleTaggedError'
import { AuthService } from '../services/auth'

const UserNotFound = Sc.TaggedStruct('NotFound', {
  message: Sc.String
})

export const action = Remix.action(
  T.gen(function* () {
    const api = yield* AuthService
    const cookieSession = yield* CookieSessionStorage
    const { username } = yield* HttpServerRequest.schemaBodyForm(
      Sc.Struct({
        username: Sc.String
      })
    )

    yield* T.logInfo(`Remix Action Login Page Login.... ${username}`)
    return yield* api.login(username).pipe(
      T.flatMap(({ token }) => cookieSession.commitUserInfo({ username, token })),
      T.catchTag('ResponseError', error => pipe(error.response.text, T.map(SimpleTaggedError)))
    )
  }).pipe(
    T.catchAll(error => Sc.decode(UserNotFound)({ message: error.toString(), _tag: 'NotFound' }))
  )
)

export default function Login() {
  const [isNotFound, setIsNotFound] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const actionData = useActionData<typeof action>()

  useEffect(() => {
    const match = Match.type<typeof actionData>().pipe(
      Match.when(undefined, () => setIsNotFound(false)),
      Match.tag('NotFound', ({ message }) => {
        setIsNotFound(true)
        setErrorMessage(message)
      }),
      Match.tag('SimpleTaggedError', ({ message }) => {
        setIsNotFound(true)
        setErrorMessage(message)
      }),
      Match.orElse(() => '')
    )
    match(actionData)
  }, [actionData])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 ">
            Connexion
          </h2>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          {isNotFound && (
            <div className="rounded-md bg-red-50  p-4">
              <div className="text-sm text-red-700 ">
                Utilisateur non trouvé {errorMessage}
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="username"
                name="username"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500  text-gray-900  bg-white  rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Login"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Se connecter
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}
