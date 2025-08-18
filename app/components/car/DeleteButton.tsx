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
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0"
    >
      <Button
        onClick={handleClick}
        type="button"
        className={`shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-3 min-h-[44px] whitespace-nowrap bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600`}
        aria-label="Ajouter un trajet"
      >
        <Trash2
          className={`h-4 w-4 lg:h-5 lg:w-5 mr-2 transition-transform duration-200 
                     
                    `}
        />

        Supprimer
      </Button>
    </motion.div>
  )
}
