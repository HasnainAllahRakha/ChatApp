import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import Logo from "./logo"
import SearchBar from "./search-bar"
import NotificationBell from "./notification-bell"
import ProfileDropdown from "./profile-dropdown"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and app name */}
          <Logo />

          {/* Desktop navigation - hidden on mobile, visible on md and up */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <SearchBar />
            <NotificationBell />
            <ProfileDropdown />
          </div>

          {/* Mobile menu button - visible on mobile, hidden on md and up */}
          <div className="flex items-center md:hidden">
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 overflow-hidden md:hidden"
          >
            <div className="px-4 py-3 space-y-3">
              <SearchBar />
              <ProfileDropdown isMobile={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
