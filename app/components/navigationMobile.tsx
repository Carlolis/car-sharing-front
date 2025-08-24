import { motion } from 'motion/react'
import type React from 'react'

import { LogIn, LogOut, X } from 'lucide-react'
import { Form, NavLink } from 'react-router'
import { Button } from './ui/button'
import { SidebarMenuButton } from './ui/sidebar'

interface NavigationMobileProps {
  isOpen: boolean
  onClose: () => void
  logoComponent: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menuItems: Array<{ id: string; label: string; icon: React.ComponentType<any> }>
  isAuthenticated: boolean
  currentPage: string
}

const NavigationMobile: React.FC<NavigationMobileProps> = ({
  isOpen,
  onClose,
  logoComponent,
  menuItems,
  isAuthenticated,
  currentPage
}) => {
  if (!isOpen) return null

  return (
    <div className="flex flex-col w-full">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 z-40 "
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 left-0 w-full bg-[#004D55] z-50  shadow-2xl text-white"
      >
        <div className="flex flex-col w-full ">
          {/* Header avec plus d'espace pour le logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#004D55] min-h-[80px]">
            <div className="flex-1 flex justify-center pr-12">
              {logoComponent}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] p-0 flex items-center justify-center text-white hover:bg-white/10 absolute right-6"
            >
              <X className="h-8 w-8" />
            </Button>
          </div>

          {/* Menu Items avec espacement amélioré */}
          <div className="flex-1 p-6 bg-[#004D55]">
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <NavLink
                  onClick={onClose}
                  key={item.id}
                  to={item.id}
                  className={`transition-colors duration-200 text-base font-body cursor-pointer  ${
                    currentPage === '/' + item.id ?
                      'text-white font-medium' :
                      'text-white/90 group-hover:text-white'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start p-6 min-h-[68px] text-lg transition-all duration-200 rounded-lg font-body ${
                        currentPage === item.id ?
                          'bg-[#56FCFF]/20 text-white shadow-lg' :
                          'text-white/90 hover:text-white'
                      }`}
                      style={{
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      <motion.div
                        className="flex items-center gap-4 w-full"
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                          className="min-w-[40px] min-h-[40px] flex items-center justify-center"
                        >
                          <item.icon
                            className={`h-10 w-10 transition-colors duration-200 ${
                              currentPage === item.id ? 'text-[#56FCFF]' : 'text-white/80'
                            }`}
                          />
                        </motion.div>
                        <span
                          className={`transition-colors duration-200 text-lg font-body ${
                            currentPage === item.id ? 'text-white font-medium' : 'text-white/90'
                          }`}
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {item.label}
                        </span>
                      </motion.div>
                    </Button>
                  </motion.div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
        {isAuthenticated ?
          (
            <Form method="post">
              <SidebarMenuButton
                onClick={onClose}
                className="p-8 cursor-pointer w-full mb-2 transition-all duration-200 hover:scale-105 group text-base min-h-[44px] hover:bg-white/10 hover:shadow-md"
                type="submit"
                style={{
                  fontFamily: 'Lato, sans-serif'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <motion.div
                    className="flex items-center gap-3 w-full"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      className="min-w-[24px] min-h-[24px] flex items-center justify-center"
                    >
                      <LogOut className="h-6 w-6 transition-colors duration-200 text-red-400 group-hover:text-red-300" />
                    </motion.div>

                    <span
                      className={`transition-colors duration-200 text-base  `}
                    >
                      Déconnexion
                    </span>
                  </motion.div>
                </motion.div>
              </SidebarMenuButton>
            </Form>
          ) :
          (
            <SidebarMenuButton
              className="cursor-pointer w-full mb-2 transition-all duration-200 hover:scale-105 group text-base min-h-[44px] hover:bg-white/10 hover:shadow-md"
              type="submit"
              style={{
                fontFamily: 'Lato, sans-serif'
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <motion.div
                  className="flex items-center gap-3 w-full"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-[24px] min-h-[24px] flex items-center justify-center"
                  >
                    <LogIn />
                  </motion.div>

                  <NavLink
                    to={'/login'}
                    className="transition-colors duration-200 text-base font-body text-white/90 group-hover:text-white"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Connexion
                  </NavLink>
                </motion.div>
              </motion.div>
            </SidebarMenuButton>
          )}
      </motion.div>
    </div>
  )
}

export default NavigationMobile
