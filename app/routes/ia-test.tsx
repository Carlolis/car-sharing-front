import * as T from 'effect/Effect'
import { useEffect, useState } from 'react'
import { useActionData, useFormAction, useSubmit } from 'react-router'

import { Remix } from '~/runtime/Remix'

export const action = Remix.action(
  T.succeed({ response: true })
)

export default function IA() {
  const actionData = useActionData<typeof action>()

  const submit = useSubmit()
  console.log('actionData', actionData)
  return (
    <>
      {actionData?.response ?
        <div>Test</div> :
        (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <button
              onClick={() => {
                const formData = new FormData()
                formData.append('_tag', 'wakeUp')
                submit(formData, {
                  method: 'POST'
                })
              }}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              <h1 className="text-4xl font-bold text-white">
                Réveiller le chat !
              </h1>
            </button>
          </div>
        )}
    </>
  )
}
