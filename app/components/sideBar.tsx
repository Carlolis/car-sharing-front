import { LogIn, LogOut, Menu } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Form, NavLink, useLocation } from 'react-router'
import autoPartageLogo from '../assets/logo.png'
import NavigationMobile from './navigationMobile'
import { Button } from './ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from './ui/sidebar'

interface SideBarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menuItems: { id: string; label: string; icon: React.ComponentType<any> }[]
  isAuthenticated: boolean
}

export const SideBar = ({ menuItems, isAuthenticated }: SideBarProps) => {
  const { pathname: currentPage } = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <SidebarProvider>
      <div className="flex lg:min-h-screen border-r-0 w-full">
        {/* Navigation Mobile */}
        <div className="lg:hidden flex justify-between border-r-0 bg-[#004D55] text-white w-full px-4 p-2 lg:w-50">
          <Button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center justify-center text-[rgba(86,252,255,1)] hover:text-[#004D55]/80 w-12 h-12"
          >
            <Menu className="!w-12 !h-12" />
          </Button>
          <img
            src={autoPartageLogo}
            alt="AutoPartage en famille"
            className={`h-10 w-auto object-contain `}
            style={{ fontFamily: 'Lato, sans-serif' }}
          />
        </div>

        {/* Navigation Desktop */}
        <Sidebar className="!hidden lg:!flex border-r-0 bg-[#004D55] text-white">
          <SidebarHeader className="border-b border-white/10 p-8 bg-[#004D55]">
            {/* <LogoComponent />*/}
            <img
              src={autoPartageLogo}
              alt="AutoPartage en famille"
              className={`h-15 w-auto object-contain`}
              style={{ fontFamily: 'Lato, sans-serif' }}
            />
          </SidebarHeader>
          <SidebarContent className="p-6 bg-[#004D55]">
            <SidebarMenu>
              {isAuthenticated
                && menuItems.map((item, index) => (
                  <SidebarMenuItem key={item.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <NavLink
                        to={item.id}
                        className={`transition-colors duration-200 text-base font-body cursor-pointer  ${
                          currentPage === '/' + item.id ?
                            'text-white font-medium' :
                            'text-white/90 group-hover:text-white'
                        }`}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <SidebarMenuButton
                          isActive={currentPage === '/' + item.id}
                          className={` cursor-pointer w-full mb-3 transition-all duration-200 hover:scale-105 group text-base min-h-[48px] rounded-lg font-body px-4 py-3 ${
                            currentPage === '/' + item.id ?
                              '!bg-[#56FCFF]/20 text-white shadow-lg border-0' :
                              'hover:bg-white/10 text-white/90 hover:text-white'
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
                              className="min-w-[24px] min-h-[24px] flex items-center justify-center"
                            >
                              <item.icon
                                className={`h-6 w-6 transition-colors duration-200 ${
                                  currentPage === '/' + item.id ?
                                    'text-[#56FCFF]' :
                                    'text-white/80 group-hover:text-white'
                                }`}
                              />
                            </motion.div>
                            {item.label}
                          </motion.div>
                        </SidebarMenuButton>
                      </NavLink>
                    </motion.div>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 bg-[#004D55] border-t border-white/10">
            <SidebarMenu>
              <SidebarMenuItem>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  {isAuthenticated ?
                    (
                      <Form method="post">
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
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        {/* Navigation Mobile */}
        <NavigationMobile
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          logoComponent={
            <img
              src={autoPartageLogo}
              alt="AutoPartage en famille"
              className={`h-15 w-auto object-contain`}
              style={{ fontFamily: 'Lato, sans-serif' }}
            />
          }
          menuItems={menuItems}
          isAuthenticated={isAuthenticated}
          currentPage={currentPage}
        />
      </div>
    </SidebarProvider>
  )
}
