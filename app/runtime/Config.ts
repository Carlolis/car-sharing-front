import {
  Config as EConfig,
  Context,
  pipe
} from 'effect'
import type { ConfigError } from 'effect/ConfigError'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import * as L from 'effect/Layer'
import { Info, type LogLevel } from 'effect/LogLevel'
// Declaring a tag for the Config service

export class Config extends Context.Tag('Config')<
  Config,
  {
    readonly getConfig: T.Effect<{
      readonly logLevel: LogLevel
      readonly SECRET: string
      readonly DOMAIN: string
      readonly API_URL: string
    }, ConfigError>
  }
>() {}

// Layer<Config, never, never>

export const ConfigLive = L.succeed(Config, {
  getConfig: T.gen(function* () {
    const logLevel = yield* pipe(
      EConfig.logLevel('LOG_LEVEL'),
      EConfig.withDefault(Info)
    )
    const API_URL = yield* pipe(
      EConfig.string('API_URL'),
      EConfig.withDefault('http://localhost:8081/api')
    )

    const SECRET = yield* pipe(
      EConfig.string('SECRET'),
      EConfig.withDefault('s3cr3t')
    )

    const DOMAIN = yield* pipe(
      EConfig.string('DOMAIN'),
      EConfig.withDefault('localhost')
    )
    yield* T.logInfo(
      `ConfigLive - Loaded configuration: logLevel=${
        stringify(logLevel)
      }, API_URL=${API_URL}, SECRET=${SECRET}, DOMAIN=${DOMAIN}`
    )

    return ({
      logLevel,
      API_URL,
      SECRET,
      DOMAIN
    })
  })
})
