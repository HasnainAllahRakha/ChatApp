"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell } from "lucide-react"

// Dummy notification data
const dummyNotifications = [
  {
    id: 1,
    title: "New message",
    message: "You received a new message from John Doe",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Friend request",
    message: "Jane Smith sent you a friend request",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "System update",
    message: "ChatConnect has been updated to version 2.0",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    title: "New feature",
    message: "Check out our new video chat feature!",
    time: "2 days ago",
    read: true,
  },
  {
    id: 5,
    title: "Security alert",
    message: "Your account was accessed from a new device",
    time: "3 days ago",
    read: true,
  },
  {
    id: 6,
    title: "Welcome!",
    message: "Welcome to ChatConnect! Start connecting with friends.",
    time: "1 week ago",
    read: true,
  },
]

export default function NotificationBell() {
  const [notifications, setNotifications] = useState(dummyNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const notificationRef = useRef(null)

  const unreadCount = notifications.filter((notification) => !notification.read).length

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-10"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-800">
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No notifications</div>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <li key={notification.id} className="border-b border-gray-100 last:border-b-0">
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-800">{notification.title}</p>
                          <span className="text-xs text-gray-500 ml-2">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
