import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, MessageCircle } from "lucide-react"

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  type = "question", // question, success, warning
}) {
  const [isVisible, setIsVisible] = useState(isOpen)

  useEffect(() => {
    setIsVisible(isOpen)
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="w-8 h-8 text-green-500" />
      case "warning":
        return <AlertCircle className="w-8 h-8 text-yellow-500" />
      default:
        return <MessageCircle className="w-8 h-8 text-primary-500" />
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-primary-50 p-3 rounded-full">{getIcon()}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-gray-600 mt-1">{message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-5 py-3 bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors text-center"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
