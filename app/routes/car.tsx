import * as T from 'effect/Effect'
import { Remix } from '~/runtime/Remix'
import { Unexpected } from '~/runtime/ServerResponse'
import { CarService } from '~/services/car'
import type { Route } from './+types/car'

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

export default function Cars({ loaderData: { car } }: Route.ComponentProps) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cars</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div key={car.name} className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">{car.name}</h2>
          <p className="text-gray-600">{car.mileage} km</p>
        </div>
      </div>
    </div>
  )
}
