import { useState, useEffect } from "react"
import { useAuth } from "../Context/AuthContext"
import { useChat } from "../Context/ChatContext"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, ArrowLeft, Search, X, MessageCircle, AlertCircle, Users, Settings } from "lucide-react"
import axios from "axios"
import { Chat_Fetch } from "../url"
import ProfileModal from "../components/UI/profile-modal"
import GroupChatModal from "../components/UI/group-chat-modal"
import GroupSettingsModal from "../components/UI/group-settings-modal"
import Messages from "../Components/Messages/Message";
import { useToast } from "../Components/Toast/toast"

const Chat = () => {
  const { user } = useAuth()
  const { selectedChat, setSelectedChat, chats, setChats } = useChat()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChatList, setShowChatList] = useState(true)
  const [messages, setMessages] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showGroupTooltip, setShowGroupTooltip] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showGroupChatModal, setShowGroupChatModal] = useState(false)
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const { error: toastError } = useToast()

  // Fetch chats from API
  const fetchChats = async () => {
    setLoading(true)
    setError(null)

    try {
      const config = {
        headers: {
          Authorization: `bearer ${user?.token}`,
        },
      }

      const { data } = await axios.get(Chat_Fetch, config)
      setChats(data)
    } catch (error) {
      console.error("Error fetching chats:", error)
      setError("Failed to load chats. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch chats on component mount
  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user])

  // Handle chat selection
  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    // Reset messages when changing chats
    setMessages([])
    // On mobile, show the messages view
    if (window.innerWidth < 768) {
      setShowChatList(false)
    }
  }

  // Get the other user in a 1-on-1 chat
  const getChatName = (chat) => {
    if (!chat.users) return "Chat"
    return chat.isGroupChat ? chat.chatName : chat.users.find((u) => u._id !== user?._id)?.name || "Chat"
  }

  // Get the other user object in a 1-on-1 chat
  const getChatUser = (chat) => {
    if (!chat.users) return null
    return chat.isGroupChat ? null : chat.users.find((u) => u._id !== user?._id)
  }

  // Handle opening user profile
  const handleOpenProfile = () => {
    if (selectedChat) {
      if (selectedChat.isGroupChat) {
        setShowGroupSettingsModal(true)
      } else {
        const chatUser = getChatUser(selectedChat)
        if (chatUser) {
          setSelectedUser(chatUser)
          setShowProfileModal(true)
        }
      }
    }
  }

  // Format date for last message
  const formatMessageDate = (timestamp) => {
    if (!timestamp) return ""

    const messageDate = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return messageDate.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Filter chats based on search query
  const filteredChats =
    searchQuery && chats
      ? chats.filter((chat) => {
          const chatName = getChatName(chat).toLowerCase()
          return chatName.includes(searchQuery.toLowerCase())
        })
      : chats

  return (
    <>
      <div className="h-[calc(100vh-64px)] flex bg-gray-100">
        {/* Left Container - Chat List */}
        <AnimatePresence mode="wait">
          {(showChatList || window.innerWidth >= 768) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`bg-white w-full md:w-1/3 lg:w-1/4 flex flex-col border-r border-gray-200 ${
                !showChatList && "hidden md:flex"
              }`}
            >
              {/* Chat List Header - Fixed */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">My Chats</h2>
                  <div className="relative">
                    <button
                      className="flex items-center bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 transition-colors"
                      onClick={() => setShowGroupChatModal(true)}
                      onMouseEnter={() => setShowGroupTooltip(true)}
                      onMouseLeave={() => setShowGroupTooltip(false)}
                    >
                      <UserPlus size={18} className="mr-1" />
                      <span className="text-sm">New Group</span>
                    </button>
                    {showGroupTooltip && (
                      <div className="absolute right-0 bottom-full mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                        Create a new group chat
                        <div className="absolute bottom-0 right-3 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Search chats */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Chat List - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-gray-500">Loading your conversations...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-red-500 mb-4">
                      <AlertCircle size={40} />
                    </div>
                    <p className="text-gray-700 mb-4 text-center">{error}</p>
                    <button
                      onClick={fetchChats}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : !filteredChats || filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
                    <Users size={40} className="mb-3 text-gray-400" />
                    <p className="text-center mb-2">
                      {searchQuery ? "No matching chats found" : "No conversations yet"}
                    </p>
                    <p className="text-center text-sm">
                      {searchQuery ? "Try a different search term" : "Search for users to start chatting"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredChats.map((chat) => (
                      <button
                        key={chat._id}
                        onClick={() => handleChatSelect(chat)}
                        className={`w-full p-3 flex items-start hover:bg-gray-50 transition-colors ${
                          selectedChat?._id === chat._id ? "bg-primary-50" : ""
                        }`}
                      >
                        {chat.isGroupChat ? (
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <Users size={24} className="text-primary-600" />
                          </div>
                        ) : (
                          <img
                            src="User.jpg"
                            alt={getChatName(chat)}
                            className="w-12 h-12 rounded-full mr-3 object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-medium text-gray-900 truncate">
                              {getChatName(chat)}
                              {chat.isGroupChat && (
                                <span className="ml-1 text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded">
                                  Group
                                </span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {chat.latestMessage ? formatMessageDate(chat.latestMessage.createdAt) : ""}
                            </span>
                          </div>
                          <p className="text-sm text-start text-gray-600 truncate mt-1">
                            {chat.latestMessage ? (
                              <>
                                {chat.latestMessage.sender?._id === user?._id ? "You: " : ""}
                                {chat.latestMessage.content}
                              </>
                            ) : (
                              "No messages yet"
                            )}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Container - Messages */}
        <AnimatePresence mode="wait">
          {(!showChatList || window.innerWidth >= 768) && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`bg-white flex-1 flex flex-col ${showChatList && "hidden md:flex"}`}
            >
              {selectedChat ? (
                <>
                  {/* Chat Header - Fixed */}
                  <div className="p-4 border-b border-gray-200 flex items-center">
                    {window.innerWidth < 768 && (
                      <button onClick={() => setShowChatList(true)} className="mr-3 text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={20} />
                      </button>
                    )}
                    <button
                      onClick={handleOpenProfile}
                      className="flex items-center flex-1 hover:bg-gray-50 p-1 rounded-md transition-colors"
                    >
                      {selectedChat.isGroupChat ? (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <Users size={20} className="text-primary-600" />
                        </div>
                      ) : (
                        <img
                          src="User.jpg"
                          alt={getChatName(selectedChat)}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900">{getChatName(selectedChat)}</h3>
                          {selectedChat.isGroupChat && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded">
                              Group
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-start text-gray-500">
                          {selectedChat.isGroupChat ? `${selectedChat.users.length} members` : "Online"}
                        </p>
                      </div>
                    </button>
                    {selectedChat.isGroupChat && selectedChat.groupAdmin[0]?._id === user?._id && (
                      <button
                        onClick={() => setShowGroupSettingsModal(true)}
                        className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        <Settings size={20} />
                      </button>
                    )}
                  </div>

                  {/* Messages Component */}
                  <Messages selectedChat={selectedChat} messages={messages} setMessages={setMessages} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <MessageCircle size={48} className="text-primary-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Chat Selected</h3>
                  <p className="text-center max-w-md">
                    Select a user from the chat list to start messaging or search for a user to start a new
                    conversation.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} user={selectedUser} />

      <GroupChatModal isOpen={showGroupChatModal} onClose={() => setShowGroupChatModal(false)} />

      <GroupSettingsModal
        isOpen={showGroupSettingsModal}
        onClose={() => setShowGroupSettingsModal(false)}
        chat={selectedChat}
      />
    </>
  )
}

export default Chat
