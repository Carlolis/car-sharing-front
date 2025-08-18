import { Car, LogIn, LogOut } from 'lucide-react'
import { motion } from 'motion/react'
import { Form, NavLink, useLocation } from 'react-router'
import autoPartageLogo from '../assets/logo.png'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from './ui/sidebar'

interface SideBarProps {
  menuItems: { id: string; color: string; label: string; icon: React.FC }[]
  isAuthenticated: boolean
}

export const SideBar = ({ menuItems, isAuthenticated }: SideBarProps) => {
  const { pathname: currentPage } = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen ">
        {/* Navigation Desktop */}
        <Sidebar className="hidden lg:flex border-r border-slate-200/60  backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            {/* <LogoComponent />*/}
            <img
              src={autoPartageLogo}
              alt="AutoPartage en famille"
              className={`h-10 w-auto object-contain`}
              style={{ fontFamily: 'Lato, sans-serif' }}
            />
          </SidebarHeader>
          <SidebarContent className="p-4 ">
            <SidebarMenu>
              {isAuthenticated
                && menuItems.map((item, index) => (
                  <SidebarMenuItem key={item.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <SidebarMenuButton
                        isActive={currentPage === '/' + item.id}
                        className={`cursor-pointer w-full mb-2 transition-all duration-200 hover:scale-105 group text-base min-h-[44px] ${
                          currentPage === item.id ?
                            'bg-gradient-to-r shadow-lg border-0' :
                            'hover:bg-white/70 hover:shadow-md'
                        }`}
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          background: currentPage === '/' + item.id ?
                            `linear-gradient(135deg, ${item.color}20, ${item.color}35)` :
                            undefined,
                          borderLeft: currentPage === '/' + item.id ?
                            `4px solid ${item.color}` :
                            undefined
                        }}
                      >
                        <motion.div
                          className="flex items-center gap-3 w-full"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                            className="min-w-[24px] min-h-[24px] flex items-center justify-center"
                          >
                            <item.icon />
                          </motion.div>

                          <NavLink
                            to={item.id}
                            className={`transition-colors duration-200 text-base ${
                              currentPage === '/' + item.id ?
                                'text-slate-800 font-medium' :
                                'text-slate-600 group-hover:text-slate-700'
                            }`}
                            style={{ fontFamily: 'Lato, sans-serif' }}
                          >
                            {item.label}
                          </NavLink>
                        </motion.div>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                ))}
              {isAuthenticated ?
                (
                  <Form method="post">
                    <SidebarMenuButton
                      className="cursor-pointer w-full mb-2 transition-all duration-200 hover:scale-105 group text-base min-h-[44px] hover:bg-white/70 hover:shadow-md"
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
                            <LogOut />
                          </motion.div>

                          <span className={`transition-colors duration-200 text-base `}>
                            Déconnexion
                          </span>
                        </motion.div>
                      </motion.div>
                    </SidebarMenuButton>
                  </Form>
                ) :
                (
                  <SidebarMenuButton
                    className="cursor-pointer w-full mb-2 transition-all duration-200 hover:scale-105 group text-base min-h-[44px] hover:bg-white/70 hover:shadow-md"
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

                        <span className={`transition-colors duration-200 text-base `}>
                          Connexion
                        </span>
                      </motion.div>
                    </motion.div>
                  </SidebarMenuButton>
                )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </div>
    </SidebarProvider>
  )
}
