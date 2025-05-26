import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Settings, HelpCircle, ChevronDown, LogOut } from "lucide-react"
import { useAuth } from "../../Context/AuthContext"

// Dummy user data
const dummyUser = {
  role: "Regular User",
}

export default function ProfileDropdown({ isMobile = false }) {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    // Handle logout logic here
    logout()
    console.log("Logging out...")
  }

  if (isMobile) {
    return (
      <div className="py-2">
        <div className="flex items-center px-3 py-2">
          <img src="User.jpg" alt={user?.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
          <div>
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <ProfileMenuItem icon={<User size={18} />} text="My Profile" />
          <ProfileMenuItem icon={<Settings size={18} />} text="Settings" />
          <ProfileMenuItem icon={<HelpCircle size={18} />} text="Help & Support" />
          <ProfileMenuItem
            icon={<LogOut size={18} />}
            text="Logout"
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <img src="User.jpg" alt={user?.name} className="w-8 h-8 rounded-full object-cover" />
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
        />
      </button>

      {/* Profile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10"
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center">
                <img src="User.jpg" alt={user?.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                <div>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  {dummyUser?.role}
                </span>
              </div>
            </div>
            <div className="py-1">
              <ProfileMenuItem icon={<User size={18} />} text="My Profile" />
              <ProfileMenuItem icon={<Settings size={18} />} text="Settings" />
              <ProfileMenuItem icon={<HelpCircle size={18} />} text="Help & Support" />
              <div className="border-t border-gray-100 my-1"></div>
              <ProfileMenuItem
                icon={<LogOut size={18} />}
                text="Logout"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProfileMenuItem({ icon, text, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
    >
      <span className="mr-2 text-gray-500">{icon}</span>
      {text}
    </button>
  )
}
