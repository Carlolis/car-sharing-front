import * as T from 'effect/Effect'
import { LogIn } from 'lucide-react'
import { motion } from 'motion/react'
import { NavLink } from 'react-router'
import { Button } from '~/components/ui/button'
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
    <div className="relative z-10 p-6 lg:p-12 w-full">
      {user && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-6"
          role="alert"
        >
          <strong className="font-bold">Bravo !</strong>
          <span className="block sm:inline">
            {' '}Vous êtes connecté en tant que {user}.
          </span>
        </div>
      )}
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
          >
            Partagez la voiture simplement
          </h1>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {!user ?
              (
                <NavLink
                  to={'/login'}
                  className="transition-colors duration-200 text-base font-body  group-hover:text-white"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <Button
                    className=" text-white cursor-pointer w-full mb-2 transition-all duration-200 hover:scale-105 group text-base min-h-[44px] hover:shadow-md bg-[#004d55]"
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
                </NavLink>
              ) :
              null}
          </div>
        </div>
      </div>
    </div>
  )
}
