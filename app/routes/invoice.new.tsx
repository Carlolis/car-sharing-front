import { HttpServerRequest } from '@effect/platform'
import { Match } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { useEffect, useState } from 'react'
import { Form, useActionData } from 'react-router'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Remix } from '~/runtime/Remix'
import { Redirect } from '~/runtime/ServerResponse'
import { ApiService } from '~/services/api'

import { InvoiceCreate } from '~/types/InvoiceCreate'

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Creating Invoice....`)

    const api = yield* ApiService

    const invoiceCreate = yield* HttpServerRequest.schemaBodyForm(
      InvoiceCreate
    )

    yield* T.logInfo(`Creating Invoice.... ${stringify(invoiceCreate)}`)
    const tripId = yield* api.createInvoice(invoiceCreate).pipe(
      T.map(tripId => ({ tripId })),
      T.catchAll(error => T.succeed({ error }))
    )
    yield* T.logInfo(`Invoice created .... ${stringify(tripId)}`)
    return tripId
  }).pipe(
    T.tapError(T.logError),
    T.catchAll(() => new Redirect({ location: '/invoice/new' }))
  )
)

export default function CreateInvoice() {
  const actionData = useActionData<typeof action>()

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [tripInfos, setTripInfos] = useState<string | undefined>(undefined)

  useEffect(() => {
    const match = Match.type<typeof actionData>().pipe(
      Match.when(
        undefined,
        () => {
          setErrorMessage('Une erreur est survenue lors de la création du trajet')
        }
      ),
      Match.when({ error: Match.any }, error => {
        setErrorMessage(error.error.toString())
      }),
      Match.when({ tripId: Match.string }, ({ tripId }) => {
        setErrorMessage('Une erreur est survenue lors de la création du trajet')
      }),
      Match.orElse(() => {
        setTripInfos('A')
      })
    )

    match(actionData)
  }, [actionData])

  const personnes = [
    { id: 'maé' as const, name: 'Maé' },
    { id: 'charles' as const, name: 'Charles' },
    { id: 'brigitte' as const, name: 'Brigitte' }
  ]

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Créer une nouvelle facture</h2>

      {errorMessage && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
          {errorMessage}
        </div>
      )}

      {tripInfos && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded">
          {tripInfos}
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
              className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900  "
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date

            <input
              type="date"
              name="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900  "
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
              className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900  "
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Qui ?
            <div className="flex flex-col gap-2">
              {personnes.map(personne => (
                <div key={personne.id} className="flex items-center gap-3">
                  <Checkbox
                    name="drivers"
                    value={personne.id}
                  />
                  <Label htmlFor="toggle">{personne.name}</Label>
                </div>
              ))}
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:cursor-pointer"
        >
          Créer le trajet
        </button>
      </Form>
    </div>
  )
}
