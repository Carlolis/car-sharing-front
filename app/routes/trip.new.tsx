import { HttpServerRequest } from '@effect/platform'
import { Match } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { useEffect, useState } from 'react'
import { Form, useActionData } from 'react-router'
import { Remix } from '~/runtime/Remix'
import { Redirect } from '~/runtime/ServerResponse'
import { ApiService } from '~/services/api'
import { TripCreate } from '~/types/api'

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Creating Trip....`)

    const api = yield* ApiService

    const tripCreate = yield* HttpServerRequest.schemaBodyForm(
      TripCreate
    )

    yield* T.logInfo(`Creating Trip.... ${stringify(tripCreate)}`)
    const tripId = yield* api.createTrip(tripCreate)
    yield* T.logInfo(`Trip created .... ${stringify(tripId)}`)
    return { tripId }
  }).pipe(
    T.tapError(T.logError),
    T.catchAll(() => new Redirect({ location: '/trip/new' }))
  )
)

export default function CreateTrip() {
  const actionData = useActionData<typeof action>()

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [userName, setUserName] = useState<string | undefined>(undefined)

  useEffect(() => {
    const match = Match.type<typeof actionData>().pipe(
      Match.when(undefined, () => setErrorMessage('Bienvenue')),
      Match.orElse(({ tripId }) => {
        setUserName(tripId)
      })
    )
    match(actionData)
  }, [actionData])
  console.log('toto')

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Créer un nouveau trajet</h2>

      {errorMessage && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded">
          {errorMessage}
        </div>
      )}
      {userName && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded">
          {userName}
        </div>
      )}

      <Form
        method="post"
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quoi ?
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quand

            <input
              type="date"
              name="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Distance (km)

            <input
              type="number"
              name="distance"
              required
              min="0"
              step="0.1"
              className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Qui ?
            <select
              name="drivers"
              required
              multiple
              className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="maé">Maé</option>
              <option value="charles">Charles</option>
              <option value="brigitte">Brigitte</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Créer le trajet
        </button>
      </Form>
    </div>
  )
}
