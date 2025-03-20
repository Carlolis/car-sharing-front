import { Schema as Sc } from 'effect'

export const IArguments = Sc.Union(
  Sc.TaggedStruct('wakeUp', {}),
  Sc.TaggedStruct('ask', {
    question: Sc.String,
    model: Sc.String,
    chatUuid: Sc.String
  }),
  Sc.TaggedStruct('newChat', {
    name: Sc.String
  })
)

export type IArguments = typeof IArguments.Type
