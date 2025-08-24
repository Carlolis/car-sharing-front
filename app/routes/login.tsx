import { HttpServerRequest } from '@effect/platform'

import { Match, pipe, Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Form, useActionData, useSearchParams } from 'react-router'
import { Remix } from '~/runtime/Remix'

import { LogIn } from 'lucide-react'
import { Button } from '~/components/ui/button'
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
  const [isTokenExpired, setIsTokenExpired] = useState(false)
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

  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.has('error')) {
      setIsTokenExpired(true)
      setErrorMessage(searchParams.get('error') || '')
    }
  }, [searchParams])

  return (
    <div className="p-24 w-full">
      <div className="max-w-200 mx-auto">
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
          {isTokenExpired && (
            <>
              <div className="rounded-md bg-red-50  p-4">
                <div className="text-sm text-red-700 ">
                  Merci de vous reconnecter !
                </div>
              </div>
              <div className="rounded-md bg-red-50  p-4">
                <div className="text-sm text-red-500 ">
                  Erreur technique, si il y a un bug : {errorMessage}
                </div>
              </div>
            </>
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

          <Button
            className="cursor-pointer text-white w-full mb-2 transition-all duration-200 hover:scale-105 group text-base min-h-[44px] hover:shadow-md bg-[#004d55]"
            type="submit"
            style={{
              fontFamily: 'Lato, sans-serif'
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-3 w-full"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <LogIn color="white" />
                </motion.div>

                Connexion
              </motion.div>
            </motion.div>
          </Button>
        </Form>
      </div>
    </div>
  )
}
