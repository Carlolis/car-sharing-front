import {
  Config as EConfig,
  Context,
  pipe
} from 'effect'
import type { ConfigError } from 'effect/ConfigError'
import * as T from 'effect/Effect'
import * as L from 'effect/Layer'
import type { LogLevel } from 'effect/LogLevel'
// Declaring a tag for the Config service

export class Config extends Context.Tag('Config')<
  Config,
  {
    readonly getConfig: T.Effect<{
      readonly logLevel: LogLevel

      readonly API_URL: string
    }, ConfigError>
  }
>() {}

// Layer<Config, never, never>

export const ConfigLive = L.succeed(Config, {
  getConfig: T.gen(function* () {
    const logLevel = yield* EConfig.logLevel('LOG_LEVEL')
    const API_URL = yield* pipe(
      EConfig.string('API_URL'),
      EConfig.withDefault('http://localhost:8081/api')
    )
    return ({
      logLevel,

      API_URL
    })
  })
})
