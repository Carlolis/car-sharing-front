import * as T from 'effect/Effect'
import { Link } from 'react-router'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { Remix } from '~/runtime/Remix'
import type { Route } from './+types'

export const loader = Remix.loader(
  T.gen(function* () {
    const cookieSession = yield* CookieSessionStorage
    const user = yield* cookieSession.getUserName()

    return { user }
  }).pipe(T.catchAll(_ => T.succeed({ user: undefined })))
)

export default function Index({ loaderData: { user } }: Route.ComponentProps) {
  return (
    <div className=" px-6 pt-14 lg:px-8">
      {user && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Connecté !</strong>
          <span className="block sm:inline">
            {' '}Vous êtes connecté en tant que {user}.
          </span>
        </div>
      )}
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Partagez la voiture simplement
          </h1>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {!user ?
              (
                <Link
                  to="/login"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Connexion
                </Link>
              ) :
              (
                <Link to="/dashboard" className="text-2xl font-bold leading-8 text-blue-700">
                  Voir le tableau de bord <span aria-hidden="true">→</span>
                </Link>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
