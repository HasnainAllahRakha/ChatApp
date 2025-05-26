import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function Logo() {
  return (
    <div className="flex items-center">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center">
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-2 rounded-full mr-2">
          <MessageCircle size={20} className="text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 text-transparent bg-clip-text">
          ChatConnect
        </span>
      </motion.div>
    </div>
  )
}
