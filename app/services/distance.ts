import { HttpBody, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import type { HttpBodyError } from '@effect/platform/HttpBody'
import type { HttpClientError } from '@effect/platform/HttpClientError'
import { PlacesClient } from '@googlemaps/places/build/src/v1'
import { pipe, Schema as Sc } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import type { ParseError } from 'effect/ParseResult'
import { Config } from '../runtime/Config'
import { HttpService } from './httpClient'
// Types pour les villes et distances
export interface City {
  id: string
  name: string
}

// Schema for Google Routes API response
const RoutesApiResponse = Sc.Struct({
  routes: Sc.optional(Sc.Array(Sc.Struct({
    distanceMeters: Sc.optional(Sc.Number)
  })))
})

// Schema for the request body
const RoutesApiRequestBody = Sc.Struct({
  origin: Sc.Struct({ placeId: Sc.String }),
  destination: Sc.Struct({ placeId: Sc.String }),
  travelMode: Sc.String,
  routingPreference: Sc.String,
  languageCode: Sc.String,
  units: Sc.String
})

// @effect-diagnostics-next-line leakingRequirements:off
export class DistanceService extends T.Service<DistanceService>()('DistanceService', {
  effect: T.gen(function* () {
    const { defaultClient } = yield* HttpService

    const { GOOGLE_MAP_API_KEY } = yield* pipe(Config, T.flatMap(c => c.getConfig)) // Replace with your actual API key

    // Création du client Google Places côté serveur
    const client = new PlacesClient({
      apiKey: GOOGLE_MAP_API_KEY
    })
    const findCities = (city: string): T.Effect<City[]> =>
      T.gen(function* () {
        yield* T.logInfo(`Finding cities matching: ${city}`)

        const request = {
          textQuery: city
        }

        const places = yield* (T.promise(() =>
          client.searchText(request, {
            otherArgs: {
              // FieldMask au niveau des headers !
              headers: {
                'X-Goog-FieldMask': 'places.displayName,places.id'
              }
            }
          })
        ))
        yield* T.logInfo(
          `Result search places :  ${stringify(places[0].places)}`
        )
        // Extract text values, filter out null/undefined/empty, then map to City[]
        const raw = places[0].places ?? []
        const names = raw
          .map(p => ({ name: p.displayName?.text, id: p.id }))
          .filter((n): n is { name: string; id: string } => n.name != null && n.id != null)
        const cities: City[] = names.map(n => ({ id: n.id, name: n.name }))
        yield* T.logInfo(
          `Result search city :  ${stringify(cities)}`
        )
        return cities
      }).pipe(
        T.tapError(T.logError),
        T.annotateLogs(DistanceService.name, 'findCities')
      )

    const calculateDistance = (
      fromCityId: string,
      toCityId: string
    ): T.Effect<number, Error | HttpClientError | HttpBodyError | ParseError> =>
      T.gen(function* () {
        yield* T.logInfo(`Calculating distance from ${fromCityId} to ${toCityId}`)

        // Si les villes sont identiques, distance = 0
        if (fromCityId === toCityId) {
          return 0
        }

        const reqBodyData = {
          origin: { placeId: fromCityId },
          destination: { placeId: toCityId },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_UNAWARE',
          languageCode: 'fr-FR',
          units: 'METRIC'
        }

        const body = yield* HttpBody.jsonSchema(RoutesApiRequestBody)(reqBodyData)

        const routesRequest = pipe(
          HttpClientRequest.post('https://routes.googleapis.com/directions/v2:computeRoutes'),
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setHeader('X-Goog-Api-Key', GOOGLE_MAP_API_KEY),
          HttpClientRequest.setHeader('X-Goog-FieldMask', 'routes.distanceMeters'),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(routesRequest).pipe(
          T.tapError(T.logError)
        )

        const apiResp = yield* HttpClientResponse.schemaBodyJson(RoutesApiResponse)(response)

        const meters: number | undefined = apiResp?.routes?.[0]?.distanceMeters

        if (meters === undefined) {
          return yield* T.fail(new Error('Distance non disponible entre ces villes'))
        }

        const distanceKm = Math.round(meters / 1000)

        yield* T.logInfo(`Distance calculated: ${distanceKm} km`)

        return distanceKm
      }).pipe(
        T.tapError(T.logError),
        T.annotateLogs(DistanceService.name, 'calculateDistance')
      )

    return {
      findCities,
      calculateDistance
    }
  })
}) {}

export const DistanceLayer = DistanceService.Default
