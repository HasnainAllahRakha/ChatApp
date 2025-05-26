import { motion } from "framer-motion"
import { X, Users } from "lucide-react"

const ProfileModal = ({ isOpen, onClose, user, isGroupChat = false, chat = null }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{isGroupChat ? "Group Info" : "User Profile"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <X size={24} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {isGroupChat && chat ? (
            // Group Chat Info
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
                  <Users size={64} className="text-primary-600" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-1">{chat.chatName}</h3>
              <p className="text-gray-600 mb-4">{chat.users.length} members</p>

              <div className="w-full mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Group Admin</h4>
                <div className="flex items-center p-2 bg-gray-50 rounded-md">
                  <img src="User.jpg" alt={chat.groupAdmin.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{chat.groupAdmin.name}</p>
                    <p className="text-xs text-gray-500">{chat.groupAdmin.email}</p>
                  </div>
                </div>
              </div>

              <div className="w-full mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Members</h4>
                <div className="max-h-40 overflow-y-auto">
                  {chat.users.map((member) => (
                    <div key={member._id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <img src="User.jpg" alt={member.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // User Profile
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <img
                  src={user?.pic || "User.jpg"}
                  alt={user?.name || "User"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-1">{user?.name || "User Name"}</h3>
              <p className="text-gray-600 mb-4">{user?.email || "user@example.com"}</p>

              {user?.about && (
                <div className="w-full mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">About</h4>
                  <p className="text-gray-700">{user.about}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">Online</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">{isGroupChat ? "Created On" : "Member Since"}</p>
                <p className="font-medium text-gray-700">
                  {(isGroupChat ? chat?.createdAt : user?.createdAt)
                    ? new Date(isGroupChat ? chat.createdAt : user.createdAt).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfileModal
