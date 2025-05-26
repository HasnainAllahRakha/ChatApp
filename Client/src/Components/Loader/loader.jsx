import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        {/* Outer circle */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-primary-100"
        />

        {/* Logo container */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="relative z-10 flex items-center justify-center w-16 h-16"
        >
          <div className="absolute w-3 h-3 bg-primary-600 rounded-full -top-1 left-1/2 transform -translate-x-1/2" />
          <div className="absolute w-3 h-3 bg-primary-400 rounded-full top-1/2 -right-1 transform -translate-y-1/2" />
          <div className="absolute w-3 h-3 bg-primary-500 rounded-full -bottom-1 left-1/2 transform -translate-x-1/2" />
          <div className="absolute w-3 h-3 bg-primary-300 rounded-full top-1/2 -left-1 transform -translate-y-1/2" />
        </motion.div>

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-3 rounded-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <MessageCircle size={24} className="text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <h3 className="text-lg font-medium text-gray-900">Loading</h3>
        <motion.div className="flex space-x-1 justify-center mt-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 bg-primary-500 rounded-full"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: dot * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
        <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your experience</p>
      </motion.div>
    </div>
  )
}
