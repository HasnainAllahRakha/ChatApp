import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Search, UserPlus, AlertCircle, Edit2, UserMinus, User } from "lucide-react"
import axios from "axios"
import { useAuth } from "../../Context/AuthContext"
import { useChat } from "../../Context/ChatContext"
import { User_Search, Chat_Group_Rename, Chat_Group_add, Chat_Group_Remove } from "../../url"
import { useToast } from "../Toast/toast"

const GroupSettingsModal = ({ isOpen, onClose, chat }) => {
  const [groupName, setGroupName] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("members") // members, addUsers

  const { user } = useAuth()
  const { selectedChat, setSelectedChat, updateChat } = useChat()
  const { success, error: toastError, loading: showLoading, updateToast, removeToast, ToastList } = useToast()

  // Set initial group name when modal opens
  useEffect(() => {
    if (isOpen && chat) {
      setGroupName(chat.chatName || "")
    }
  }, [isOpen, chat])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
      setSearchQuery("")
      setSearchResults([])
      setError(null)
      setActiveTab("members")
    }
  }, [isOpen])

  // Check if current user is admin
  const isAdmin = chat?.groupAdmin[0]?._id === user?._id

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

      // Filter out users who are already in the group
      const filteredResults = data.filter(
        (searchUser) => !chat.users.some((groupUser) => groupUser._id === searchUser._id),
      )

      setSearchResults(filteredResults)
    } catch (error) {
      setError("Failed to search users")
      console.error("Error searching users:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Rename group
  const handleRenameGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name cannot be empty")
      return
    }

    if (groupName === chat.chatName) {
      setIsEditing(false)
      return
    }

    const toastId = showLoading("Renaming group...")
    setLoading(true)
    setError(null)

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${user?.token}`,
        },
      }

      const { data } = await axios.put(
        `${Chat_Group_Rename}`,
        {
          chatId: chat._id,
          chatName: groupName,
        },
        config,
      )

      // Update the chat in context
      updateChat(data)
      if (selectedChat?._id === data._id) {
        setSelectedChat(data)
      }

      setIsEditing(false)
      // Update the loading toast to a success toast
      updateToast(toastId, `Group renamed to "${groupName}"`, "success")
    } catch (error) {
      setError("Failed to rename group")
      // Update the loading toast to an error toast
      updateToast(toastId, "Failed to rename group", "error")
      console.error("Error renaming group:", error)
    } finally {
      setLoading(false)
    }
  }

  // Add user to group
  const handleAddUser = async (userToAdd) => {
    // Show loading toast first
    const toastId = showLoading(`Adding ${userToAdd.name} to the group...`)
    setLoading(true)
    setError(null)

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${user?.token}`,
        },
      }

      const { data } = await axios.put(
        `${Chat_Group_add}`,
        {
          chatId: chat._id,
          userId: userToAdd._id,
        },
        config,
      )

      // Update the chat in context
      updateChat(data)
      if (selectedChat?._id === data._id) {
        setSelectedChat(data)
      }

      // Clear search
      setSearchQuery("")
      setSearchResults([])

      // Update the loading toast to a success toast
      updateToast(toastId, `${userToAdd.name} added to the group`, "success")
    } catch (error) {
      setError("Failed to add user to group")
      // Update the loading toast to an error toast
      updateToast(toastId, "Failed to add user to group", "error")
      console.error("Error adding user to group:", error)
    } finally {
      setLoading(false)
    }
  }

  // Remove user from group
  const handleRemoveUser = async (userToRemove) => {
    // Prevent removing yourself if you're not admin
    if (userToRemove._id === user?._id && !isAdmin) {
      setError("You cannot remove yourself from the group")
      toastError("You cannot remove yourself from the group")
      return
    }

    // Prevent removing the admin if you're not the admin
    if (userToRemove._id === chat.groupAdmin[0]?._id && !isAdmin) {
      setError("You cannot remove the group admin")
      toastError("You cannot remove the group admin")
      return
    }

    // Prevent admin from removing themselves
    if (isAdmin && userToRemove._id === user?._id) {
      setError("As an admin, you cannot remove yourself from the group")
      toastError("As an admin, you cannot remove yourself from the group")
      return
    }

    // Show loading toast first
    const toastId = showLoading(
      userToRemove._id === user?._id ? "Leaving the group..." : `Removing ${userToRemove.name} from the group...`,
    )
    setLoading(true)
    setError(null)

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${user?.token}`,
        },
      }

      const { data } = await axios.put(
        `${Chat_Group_Remove}`,
        {
          chatId: chat._id,
          userId: userToRemove._id,
        },
        config,
      )

      // If you removed yourself, close the modal
      if (userToRemove._id === user?._id) {
        // Update the loading toast to a success toast
        updateToast(toastId, "You left the group", "success")
        onClose()
        // If the removed chat was selected, deselect it
        if (selectedChat?._id === chat._id) {
          setSelectedChat(null)
        }
      } else {
        // Update the chat in context
        updateChat(data)
        if (selectedChat?._id === data._id) {
          setSelectedChat(data)
        }
        // Update the loading toast to a success toast
        updateToast(toastId, `${userToRemove.name} removed from the group`, "success")
      }
    } catch (error) {
      setError("Failed to remove user from group")
      // Update the loading toast to an error toast
      updateToast(toastId, "Failed to remove user from group", "error")
      console.error("Error removing user from group:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !chat) return null

  return (
    <>
      {/* Render the ToastList component */}
      <ToastList />

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
            <h2 className="text-xl font-semibold text-gray-800">Group Settings</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Group Name */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                  Group Name
                </label>
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-800 focus:outline-none text-sm flex items-center bg-primary-50 px-2 py-1 rounded"
                  >
                    <Edit2 size={14} className="mr-1" />
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="flex ml-2">
                    <button
                      onClick={handleRenameGroup}
                      disabled={loading}
                      className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed mr-2"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setGroupName(chat.chatName)
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-800">{chat.chatName}</p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "members"
                    ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Members ({chat.users.length})
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("addUsers")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "addUsers"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Add Users
                </button>
              )}
            </div>

            {/* Members Tab */}
            {activeTab === "members" && (
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {chat.users.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <img src="User.jpg" alt={member.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {member.name}
                            {member._id === user?._id && " (You)"}
                            {member._id === chat.groupAdmin[0]?._id && (
                              <span className="ml-1 text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>

                      {/* Remove button - only show if admin or if it's yourself */}
                      {/* Don't show for admin removing themselves or for non-admins removing the admin */}
                      {((isAdmin && member._id !== user?._id) || (!isAdmin && member._id === user?._id)) &&
                        member._id !== chat.groupAdmin[0]?._id && (
                          <button
                            onClick={() => handleRemoveUser(member)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 focus:outline-none bg-red-50 p-1.5 rounded-full flex items-center justify-center"
                            title={member._id === user?._id ? "Leave group" : "Remove user"}
                          >
                            <UserMinus size={16} />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Users Tab */}
            {activeTab === "addUsers" && (
              <>
                {/* Search Users */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
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

                {/* Search Results */}
                {searchLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Searching users...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                    {searchResults.map((searchUser) => (
                      <div
                        key={searchUser._id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <img
                            src="User.jpg"
                            alt={searchUser.name}
                            className="w-8 h-8 rounded-full mr-3 object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{searchUser.name}</p>
                            <p className="text-xs text-gray-500">{searchUser.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddUser(searchUser)}
                          disabled={loading}
                          className="text-primary-600 hover:text-primary-800 focus:outline-none bg-primary-50 p-1.5 rounded-full flex items-center justify-center"
                          title="Add to group"
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery && !searchLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <User size={24} className="mx-auto mb-2 text-gray-400" />
                    <p>Search for users to add to the group</p>
                  </div>
                )}
              </>
            )}

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
            <div className="flex flex-col space-y-2">
              {!isAdmin && (
                <button
                  onClick={() => handleRemoveUser({ _id: user?._id, name: user?.name })}
                  className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Leave Group
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default GroupSettingsModal
