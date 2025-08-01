import { pipe, Schema as Sc } from 'effect'
import { useCallback, useState } from 'react'
import { Form, useSubmit } from 'react-router'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import type { TripUpdate } from '~/types/api'
import { TaggedCreateTrip } from '../car/DashboardArguments'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
type TripDialogProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void

  startDate: Date
}

export const TripDialog = (
  { isOpen, setIsOpen, startDate }: TripDialogProps
): JSX.Element => {
  console.log(startDate)
  const [isTripUpdated, setIsTripUpdated] = useState<boolean>(false)
  const submit = useSubmit()

  const personnes = [
    { id: 'maé' as const, name: 'Maé' },
    { id: 'charles' as const, name: 'Charles' },
    { id: 'brigitte' as const, name: 'Brigitte' }
  ]

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.target as HTMLFormElement)

      const tripCreate = pipe(
        formData.entries(),
        Object.fromEntries,
        trip =>
          Sc.decodeUnknownSync(TaggedCreateTrip)({
            _tag: 'create',
            tripCreate: trip
          }),
        Sc.encodeSync(TaggedCreateTrip)
      )

      submit(tripCreate, {
        action: '/calendar',
        method: 'post',
        encType: 'application/json'
      })
      setIsOpen(false)
    },
    [submit]
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="bg-white shadow-lg"
        onPointerDownOutside={event => event.preventDefault()}
      >
        <DialogTitle className="text-2xl font-bold mb-6 px-4 ">
          Créer un nouveau trajet
        </DialogTitle>
        <DialogHeader>
          <div className="max-w-md px-4">
            {
              /* {errorMessage && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
          {errorMessage}
        </div>
      )} */
            }
            {isTripUpdated && (
              <div className="mb-4 p-4 text-green-700 bg-green-100 rounded">
                {isTripUpdated}
              </div>
            )}

            <Form
              action="/dashboard"
              method="post"
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quoi ? *
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
                  Début *
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={(() => {
                      const d = new Date(startDate)
                      d.setDate(d.getDate() + 1)
                      return d.toISOString().split('T')[0]
                    })()}
                    className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900  "
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fin *
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue={undefined}
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
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-900  "
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Qui ? *
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
        </DialogHeader>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
