import { FetchHttpClient, Path } from '@effect/platform'
import { NodeContext, NodeFileSystem } from '@effect/platform-node'
import { Layer, Logger, LogLevel, pipe } from 'effect'
import * as L from 'effect/Layer'
import { IaServiceLayer } from '~/contexts/ia.util'
import { ApiLayer } from '~/services/api'

export const AppLayer = pipe(
  NodeFileSystem.layer,
  L.provideMerge(Path.layer),
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
  Layer.provideMerge(ApiLayer),
  L.provideMerge(FetchHttpClient.layer),
  L.provideMerge(NodeContext.layer),
  L.provideMerge(IaServiceLayer)
)
