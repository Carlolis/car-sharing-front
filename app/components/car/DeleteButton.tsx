import type { SubmitFunction } from 'react-router'

import { Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { RoutePaths } from '../../routes'
import { Button } from '../ui/button'
import { TaggedDeleteTrip } from './DashboardArguments'

type DeleteButtonProps = {
  tripId?: string
  submit?: SubmitFunction
  route?: RoutePaths
}

export const DeleteButton = ({ tripId, submit, route }: DeleteButtonProps): JSX.Element => {
  const handleClick = () => {
    if (!tripId || !submit || !route) return

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
    <Button
      onClick={handleClick}
      type="button"
      className="bg-red-600 hover:bg-red-700 text-white font-body"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <Trash2
        className={`h-4 w-4 lg:h-5 lg:w-5 mr-2 transition-transform duration-200 `}
      />

      Supprimer
    </Button>
  )
}
