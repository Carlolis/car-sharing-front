import { HttpBody, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { Effect as T, pipe, Schema as Sc } from 'effect'
import { stringify } from 'effect/FastCheck'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { NotAuthenticated } from '~/runtime/errors/NotAuthenticatedError'
import { Car } from '~/types/Car'
import { HttpService } from './httpClient'

export class CarService extends T.Service<CarService>()('CarService', {
  effect: T.gen(function* () {
    const { defaultClient, getRequest, putRequest } = yield* HttpService

    const getCar = () =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()
        yield* T.logDebug(`Found token....`, token)

        const getAllCarsRequest = pipe(
          getRequest,
          HttpClientRequest.appendUrl('/car'),
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`)
        )
        const response = yield* defaultClient.execute(getAllCarsRequest)

        const responseJson = yield* pipe(
          HttpClientResponse.schemaBodyJson(Car)(response),
          T.tapError(T.logError)
        )

        yield* T.logInfo(`Found ${stringify(responseJson)} car`)

        return responseJson
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        T.tapError(T.logError),
        T.annotateLogs(CarService.name, getCar.name)
      )

    const updateCar = (car: Car) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()

        yield* T.logInfo(`About to update car...`, car)

        const carUrl = pipe(putRequest, HttpClientRequest.appendUrl('/car'))

        const body = yield* HttpBody.jsonSchema(Car)({
          ...car
        })
        const updateCarRequest = pipe(
          carUrl,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(updateCarRequest)

        return yield* pipe(
          response,
          HttpClientResponse.schemaBodyJson(Sc.String),
          T.map(carId => ({ _tag: 'CarId' as const, carId }))
        )
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                // T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        // T.tapError(T.logError),
        T.annotateLogs(CarService.name, updateCar.name)
      )

    return {
      updateCar,
      getCar
    }
  })
}) {}

export const CarLayer = CarService.Default
