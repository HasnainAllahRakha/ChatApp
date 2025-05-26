import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Search, Check, AlertCircle } from "lucide-react"
import axios from "axios"
import { useAuth } from "../../Context/AuthContext"
import { useChat } from "../../Context/ChatContext"
import { User_Search,Chat_Group_Create } from "../../url"

const GroupChatModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user } = useAuth()
  const { addChat } = useChat()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setGroupName("")
      setSelectedUsers([])
      setSearchQuery("")
      setSearchResults([])
      setError(null)
    }
  }, [isOpen])

  // Search users
  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const config = {
        headers: {
          Authorization: `bearer ${user?.token}`,
        },
      }

      const { data } = await axios.get(`${User_Search}?search=${query}`, config)
      setSearchResults(data)
    } catch (error) {
      setError("Failed to search users")
      console.error("Error searching users:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Add/remove user from selected list
  const handleUserSelect = (userToAdd) => {
    // Check if user is already selected
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== userToAdd._id))
    } else {
      setSelectedUsers([...selectedUsers, userToAdd])
    }
  }

  // Create group chat
  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError("Please enter a group name")
      return
    }

    if (selectedUsers.length < 2) {
      setError("Please select at least 2 users")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${user?.token}`,
        },
      }

      // Format users as required by the API
      const users = JSON.stringify(selectedUsers.map((u) => u._id))

      const { data } = await axios.post(
        `${Chat_Group_Create}`,
        {
          name: groupName,
          users,
        },
        config,
      )

      // Add the new group chat to the chat list
      addChat(data)
      onClose()
    } catch (error) {
      setError("Failed to create group chat")
      console.error("Error creating group chat:", error)
    } finally {
      setLoading(false)
    }
  }

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
          <h2 className="text-xl font-semibold text-gray-800">Create New Group Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Group Name Input */}
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Search Users */}
          <div className="mb-4">
            <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700 mb-1">
              Add Users
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="searchUsers"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users to add"
                className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSearchResults([])
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Users ({selectedUsers.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm"
                  >
                    <span className="mr-1">{user.name}</span>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="text-primary-600 hover:text-primary-800 focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching users...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center p-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="relative mr-3">
                    <img src="User.jpg" alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    {selectedUsers.some((u) => u._id === user._id) && (
                      <div className="absolute -top-1 -right-1 bg-primary-500 rounded-full p-0.5">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery && !searchLoading ? (
            <div className="text-center py-4 text-gray-500">
              <p>No users found</p>
            </div>
          ) : null}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default GroupChatModal
