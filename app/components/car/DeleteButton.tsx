import type { SubmitFunction } from 'react-router'

import type { RoutePaths } from '../../routes'
import { TaggedDeleteTrip } from './DashboardArguments'

type DeleteButtonProps = {
  tripId?: string
  submit?: SubmitFunction
  route?: RoutePaths
}

export const DeleteButton = ({ tripId, submit, route }: DeleteButtonProps): JSX.Element => {
  const handleClick = () => {
    if (!tripId || !submit) return
    const taggedDeletedTrip = TaggedDeleteTrip.make({
      tripId
    })

    submit(taggedDeletedTrip, {
      action: route,
      method: 'post',
      encType: 'application/json'
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-150"
      aria-label="Supprimer le trajet"
    >
      Supprimer
    </button>
  )
}
