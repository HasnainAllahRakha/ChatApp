import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import axios from "axios"
import { User_Login } from "../../url"
import { useToast } from "../Toast/toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../Context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { login, rememberMe, setRememberMe } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { success, error, loading, removeToast, ToastList } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsLoading(true)
    const toastId = loading("Signing you in...")

    try {
      const response = await axios.post(User_Login, {
        email,
        password,
      })

      removeToast(toastId)

      if (response.data.status) {
        success("Login successful!")
        console.log("Login successful:", response.data)

        // Delay navigation to allow success toast to show
        login(response.data, rememberMe)
        setTimeout(() => {
          navigate("/chat")
        }, 2000) // 2000 ms = 2 seconds
      } else {
        error(response.data.message || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      removeToast(toastId)

      if (err.response?.data?.message) {
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
        className="space-y-5"
      >
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
                placeholder="name@example.com"
                required
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
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
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  transition={{
                    duration: 0.4,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
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
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              "Sign In"
            )}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-md shadow-sm transition-colors w-full"
            >
              <svg className="w-5 h-5 mr-2 inline-block" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-md shadow-sm transition-colors w-full"
            >
              <svg className="w-5 h-5 mr-2 inline-block" viewBox="0 0 24 24">
                <path
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  fill="#1877F2"
                />
                <path
                  d="M15.893 14.89l.443-2.89h-2.773v-1.876c0-.791.387-1.562 1.63-1.562h1.26v-2.46s-1.144-.195-2.238-.195c-2.285 0-3.777 1.384-3.777 3.89V12h-2.54v2.89h2.54v6.988a10.06 10.06 0 003.115 0v-6.987h2.33z"
                  fill="white"
                />
              </svg>
              Facebook
            </button>
          </div>
        </motion.div>
      </motion.form>
    </>
  )
}
