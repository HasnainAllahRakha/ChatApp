"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"
import { User_Signup } from "../../url"
import { useToast } from "../Toast/toast"

export default function Signup({ onSignupSuccess }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { success, error, loading, removeToast, ToastList } = useToast()

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) return false

    // Check if email contains .com, .net, .org, etc.
    const parts = email.split(".")
    if (parts.length < 2 || parts[parts.length - 1].length < 2) return false

    return true
  }

  const passwordStrength = () => {
    if (password.length === 0) return 0
    if (password.length < 6) return 1
    if (password.length < 10) return 2
    return 3
  }

  const getPasswordStrengthText = () => {
    const strength = passwordStrength()
    if (strength === 0) return ""
    if (strength === 1) return "Weak"
    if (strength === 2) return "Medium"
    return "Strong"
  }

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength()
    if (strength === 0) return "bg-gray-200"
    if (strength === 1) return "bg-red-500"
    if (strength === 2) return "bg-yellow-500"
    return "bg-green-500"
  }

  const passwordsMatch = () => {
    return password === confirmPassword && confirmPassword !== ""
  }

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) newErrors.name = "Name is required"

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address (e.g., name@example.com)"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    const toastId = loading("Creating your account...")

    try {
      const response = await axios.post(User_Signup, {
        name,
        email,
        password,
      })

      if (response.data.status) {
        // Remove the loading toast
        removeToast(toastId)
        // Show success toast
        success("Account created successfully!", 5000)

        // Clear form
        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")

        // Switch to login tab after a delay to allow the success toast to be seen
        setTimeout(() => {
          onSignupSuccess()
        }, 2000)
      } else {
        // Remove the loading toast
        removeToast(toastId)
        // Show error toast
        error(response.data.message || "Failed to create account")
      }
    } catch (err) {
      console.error("Signup error:", err)
      // Remove the loading toast
      removeToast(toastId)

      if (err.response && err.response.data && err.response.data.message) {
        error(err.response.data.message)
      } else {
        error("An error occurred. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <>
      <ToastList />
      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="relative">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className={`w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.name}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <div className="relative">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (email && !validateEmail(email)) {
                    setErrors({
                      ...errors,
                      email: "Please enter a valid email address (e.g., name@example.com)",
                    })
                  } else {
                    const { email, ...rest } = errors
                    setErrors(rest)
                  }
                }}
                placeholder="name@example.com"
                required
                className={`w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.email}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <div className="relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <motion.div
                initial={false}
                animate={{ scale: showPassword ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              </motion.div>
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  initial={false}
                  animate={{ rotateY: showPassword ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                  style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  {showPassword ? (
                    <motion.div
                      initial={{ opacity: 0, rotateY: -180 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EyeOff size={18} />
                    </motion.div>
                  ) : (
                    <Eye size={18} />
                  )}
                </motion.div>
              </motion.button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.password}
              </p>
            ) : (
              password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs font-medium text-gray-500">Password strength</div>
                    <div
                      className={`text-xs font-medium ${
                        passwordStrength() === 1
                          ? "text-red-500"
                          : passwordStrength() === 2
                            ? "text-yellow-500"
                            : passwordStrength() === 3
                              ? "text-green-500"
                              : ""
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength() * 33.33}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full ${getPasswordStrengthColor()}`}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <div className="relative">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <motion.div
                initial={false}
                animate={{ scale: showConfirmPassword ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword || (confirmPassword && !passwordsMatch())
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              </motion.div>
              <motion.button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  initial={false}
                  animate={{ rotateY: showConfirmPassword ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                  style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  {showConfirmPassword ? (
                    <motion.div
                      initial={{ opacity: 0, rotateY: -180 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EyeOff size={18} />
                    </motion.div>
                  ) : (
                    <Eye size={18} />
                  )}
                </motion.div>
              </motion.button>
            </div>
            {errors.confirmPassword ? (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.confirmPassword}
              </p>
            ) : (
              confirmPassword && (
                <div className="mt-1 flex items-center">
                  {passwordsMatch() ? (
                    <div className="flex items-center text-green-500 text-xs">
                      <CheckCircle size={14} className="mr-1" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500 text-xs">
                      <AlertCircle size={14} className="mr-1" />
                      Passwords don't match
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <button
            type="submit"
            disabled={isLoading || (confirmPassword !== "" && !passwordsMatch())}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              "Create Account"
            )}
          </button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-xs text-center text-gray-500 mt-4">
          By signing up, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
          .
        </motion.p>
      </motion.form>
    </>
  )
}
