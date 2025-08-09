import { FileSystem, HttpServerRequest } from '@effect/platform'
import { identity, Match, pipe, Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { useEffect, useState } from 'react'
import { Form, useActionData } from 'react-router'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { SimpleTaggedError } from '~/runtime/errors/SimpleTaggedError'
import { Remix } from '~/runtime/Remix'
import { Redirect } from '~/runtime/ServerResponse'

import { FilesSchema } from '@effect/platform/Multipart'
import { prettyErrors } from 'effect/Cause'
import * as O from 'effect/Option'
import { TreeFormatter } from 'effect/ParseResult'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { InvoiceService } from '~/services/invoice'
import { DriversArrayEnsure, LocalDate } from '~/types/api'
const InvoiceCreateForm = Sc.Struct({
  name: Sc.String,
  date: LocalDate,
  distance: Sc.NumberFromString,
  drivers: DriversArrayEnsure,
  fileBytes: Sc.optional(FilesSchema)
})

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Creating Invoice....`)

    const api = yield* InvoiceService

    const invoiceCreate = yield* HttpServerRequest.schemaBodyForm(
      InvoiceCreateForm
    )
    const file = pipe(invoiceCreate.fileBytes, O.fromNullable, O.map(file => file[0].path))

    const fs = yield* FileSystem.FileSystem

    // Reading the content of the same file where this code is written

    const content = yield* pipe(
      file,
      T.flatMap(fs.readFile),
      T.tapError(T.logWarning),
      T.catchAll(() => T.succeed(undefined))
    )

    // yield* T.logInfo(`Creating Invoice.... ${stringify(invoiceCreate)}`)
    const tripId = yield* api.createInvoice({
      ...invoiceCreate,
      fileBytes: content,
      filePath: O.getOrElse(file, () => undefined)
    }).pipe(
      T.as({ invoiceName: invoiceCreate.name, _tag: 'InvoiceName' as const })
    )
    yield* T.logInfo(`Invoice created .... ${stringify(tripId)}`)
    return tripId
  }).pipe(
    T.catchTags({
      ResponseError: error =>
        T.gen(function* () {
          const text = yield* error.response.text
          yield* T.logError('Error text : ', text)
          yield* T.logError('Description :', error.description)

          return yield* T.succeed(SimpleTaggedError(stringify(text)))
        }),
      ParseError: error =>
        T.gen(function* () {
          yield* T.logError('Parse error  : ', TreeFormatter.formatErrorSync(error))
          return yield* T.succeed(SimpleTaggedError(TreeFormatter.formatErrorSync(error)))
        })
    }),
    // T.catchTags({
    //   HttpBodyError: error => T.succeed(SimpleTaggedError(stringify(error)))
    // }),
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
        identity
      ),
      Match.tag('InvoiceName', ({ invoiceName }) => {
        setTripInfos(`La facture ${invoiceName} a été enregistrée avec succès`)
      }),
      Match.tag('SimpleTaggedError', ({ message }) => {
        setErrorMessage(message)
      }),
      Match.orElse(() => {
        setErrorMessage('Une erreur inconnue est survenue lors de la création du trajet')
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
        encType="multipart/form-data"
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
            <RadioGroup className="flex flex-col gap-2" name="drivers">
              {personnes.map(personne => (
                <div key={personne.id} className="flex items-center gap-3 ">
                  <RadioGroupItem
                    id={personne.id}
                    value={personne.name}
                  />
                  <Label htmlFor={personne.id}>{personne.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Un fichier pdf/image ?
            <input
              type="file"
              accept=".pdf, .png, .jpg, .jpeg"
              name="fileBytes"
              className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900  "
            />
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
