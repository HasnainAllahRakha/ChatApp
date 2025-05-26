"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Login from "../Components/Login/login"
import Signup from "../Components/Signup/signup"
import { MessageCircle } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  const handleSignupSuccess = () => {
    // Switch to login tab after successful signup
    setIsLogin(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-6 text-white text-center">
            <div className="flex justify-center mb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="bg-white/20 p-3 rounded-full"
              >
                <MessageCircle size={32} />
              </motion.div>
            </div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold"
            >
              ChatConnect
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 mt-1"
            >
              Connect with friends instantly
            </motion.p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                isLogin ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
              {isLogin && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                !isLogin ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
              {!isLogin && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          </div>

          {/* Form Container */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {isLogin ? <Login key="login" /> : <Signup key="signup" onSignupSuccess={handleSignupSuccess} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-gray-600 text-sm"
        >
          &copy; {new Date().getFullYear()} ChatConnect. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  )
}
