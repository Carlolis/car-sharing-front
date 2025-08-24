import { motion } from 'motion/react'
import React from 'react'
import { Card, CardContent } from '../ui/card'

export function StatsCard(
  { title, value, icon, bgColor }: {
    title: string
    value: string | number
    bgColor: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: React.ComponentType<any>
  }
) {
  const IconComponent = icon

  return (
    <React.Fragment
      key={title}
    >
      <Card
        className={`bg-gradient-${bgColor} border-0 shadow-sm hover:shadow-md transition-all duration-300`}
      >
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm text-[#004D55]/70 mb-2 font-body"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {title}
              </p>
              <p
                className="text-2xl lg:text-3xl font-bold text-[#004D55] font-heading"
                style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
              >
                {value} km
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <IconComponent className="h-8 w-8 text-[#004D55]" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </React.Fragment>
  )
}
