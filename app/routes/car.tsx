import { HttpServerRequest } from '@effect/platform'
import { Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { Form } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Remix } from '~/runtime/Remix'
import { Redirect, Unexpected } from '~/runtime/ServerResponse'
import { CarService } from '~/services/car'
import type { Route } from './+types/car'

export const UpdateMileage = Sc.Struct({
  _tag: Sc.Literal('UpdateMileage'),
  id: Sc.String,
  name: Sc.String,
  mileage: Sc.NumberFromString
})

export const loader = Remix.loader(
  T.gen(function* () {
    const carService = yield* CarService
    const car = yield* carService.getCar()

    return { car }
  }).pipe(
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchTag('ResponseError', error => new Unexpected({ error: error.message }))
  )
)

export const action = Remix.action(
  T.gen(function* () {
    const carService = yield* CarService
    const request = yield* HttpServerRequest.schemaBodyForm(UpdateMileage)

    const { id, name, mileage } = request
    yield* carService.updateCar({ id, name, mileage })

    return { _tag: 'success' }
  }).pipe(
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchTag('ResponseError', error => new Unexpected({ error: error.message })),
    T.tapError(T.logError),
    T.catchAll(() => new Redirect({ location: '/car' }))
  )
)

export default function Cars({ loaderData: { car } }: Route.ComponentProps) {
  return (
    <div className="p-12">
      <h1 className="text-2xl font-bold mb-4">Info voiture</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div key={car.name} className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">{car.name}</h2>
          <p className="text-gray-600">{car.mileage} km</p>
          <Form method="post">
            <input type="hidden" name="id" value={car.id} />
            <input type="hidden" name="name" value={car.name} />
            <input type="hidden" name="_tag" value="UpdateMileage" />
            <div className="flex items-center gap-2 mt-4">
              <Input
                type="number"
                name="mileage"
                defaultValue={car.mileage}
              />
              <Button type="submit" style={{ cursor: 'pointer' }}>
                Mettre à jour
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
