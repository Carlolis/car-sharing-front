export const SimpleTaggedError = (message: string) => ({
  message,
  _tag: 'SimpleTaggedError' as const
})
