import { MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
export function StatsCard({ title, value }: { title: string; value: string | number }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Card
        className={`bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group min-w-80`}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle
            className="text-sm lg:text-base font-medium text-slate-800"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            {title}
          </CardTitle>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.2 }}
            transition={{ duration: 0.2 }}
            className="min-w-[24px] min-h-[24px] flex items-center justify-center"
          >
            <MapPin
              className="h-5 w-5 lg:h-6 lg:w-6"
              style={{ color: '#2fd1d1' }}
            />
          </motion.div>
        </CardHeader>
        <CardContent className="relative z-10">
          <motion.div
            className="text-xl lg:text-2xl font-bold text-slate-900"
            style={{ fontFamily: 'Lato, sans-serif' }}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.3,
              delay: 1 * 0.1 + 0.2
            }}
          >
            {value}
          </motion.div>
          <p
            className="text-xs lg:text-sm text-slate-700 mt-1"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            {'Depuis le début'}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
