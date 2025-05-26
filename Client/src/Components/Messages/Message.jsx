import { useState, useEffect, useRef } from "react"
import { MessageCircle, Send } from "lucide-react"
import axios from "axios"
import { Message_Create, Fetch_Message, Socket_Endpoint } from "../../url"
import { useAuth } from "../../Context/AuthContext"
import { useToast } from "../../Components/Toast/toast"
import io from "socket.io-client"

let socket, selectedChatCompare

// Typing indicator component with beautiful animation
const TypingIndicator = ({ isVisible, userName }) => {
  if (!isVisible) return null

  return (
    <div className="flex justify-start mb-3">
      <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-3 max-w-xs">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">{userName || "Someone"} is typing</span>
          <div className="flex space-x-1 ml-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Messages = ({ selectedChat, messages, setMessages }) => {
  const [message, setMessage] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const { user } = useAuth()
  const { error: toastError, loading: showLoading, updateToast } = useToast()

  useEffect(() => {
    socket = io(Socket_Endpoint)
    socket.emit("setup", user)
    socket.on("connected", () => setSocketConnected(true))

    socket.on("typing", (userData) => {
      setIsTyping(true)
      setTypingUser(userData.name)
    })

    socket.on("stop-typing", () => {
      setIsTyping(false)
      setTypingUser("")
    })

    socket.on("message recieved", (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        // For notification
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived])
      }
    })

    return () => {
      socket.off("typing")
      socket.off("stop-typing")
      socket.off("message recieved")
      socket.off("connected")
    }
  }, [])

  // Fetch messages for a selected chat
  const fetchMessages = async () => {
    if (!selectedChat) return

    setLoadingMessages(true)
    try {
      const config = {
        headers: {
          Authorization: `bearer ${user?.token}`,
        },
      }

      const { data } = await axios.get(`${Fetch_Message}/${selectedChat._id}`, config)
      setMessages(data)
      socket.emit("join-chat", selectedChat._id)
    } catch (error) {
      toastError("Failed to load messages")
      console.error("Error fetching messages:", error)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault()

    if (!message.trim()) return

    const toastId = showLoading("Sending message...")

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${user?.token}`,
        },
      }

      const messageContent = message
      setMessage("")

      // Stop typing when sending message
      if (typing) {
        socket.emit("stop-typing", selectedChat._id)
        setTyping(false)
      }

      const { data } = await axios.post(
        `${Message_Create}`,
        {
          content: messageContent,
          chatId: selectedChat._id,
        },
        config,
      )

      socket.emit("new-message", data)
      setMessages((prevMessages) => [...prevMessages, data])
      updateToast(toastId, "Message sent", "success", 1000)
    } catch (error) {
      updateToast(toastId, "Failed to send message", "error")
      console.error("Error sending message:", error)
    }
  }

  // Typing handler with proper debouncing
  const typingHandler = (e) => {
    setMessage(e.target.value)

    if (!socketConnected) return

  if (!typing) {
  setTyping(true);
  socket.emit("typing", { room: selectedChat._id, user });
}

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
  socket.emit("stop-typing", { room: selectedChat._id });

      setTyping(false)
    }, 3000)
  }

  // Fetch messages when a chat is selected
useEffect(() => {
  if (selectedChat) {
    fetchMessages();
    selectedChatCompare = selectedChat;
  } else {
    // Stop typing if the chat is closed
    socket.emit("stop-typing", { room: selectedChatCompare?._id });
    setTyping(false);
    setIsTyping(false);
    setTypingUser("");
  }
}, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle size={40} className="mb-3 text-gray-400" />
            <p className="text-center mb-2">No messages yet</p>
            <p className="text-center text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg._id} className={`flex ${msg.sender._id === user?._id ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                    msg.sender._id === user?._id
                      ? "bg-primary-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {selectedChat.isGroupChat && msg.sender._id !== user?._id && (
                    <p className="text-xs font-medium mb-1 text-gray-600">{msg.sender.name}</p>
                  )}
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender._id === user?._id ? "text-primary-100" : "text-gray-500"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            <TypingIndicator isVisible={isTyping} userName={typingUser} />

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input - Fixed */}
      <div className="p-3 border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={typingHandler}
            placeholder="Type a message..."
            className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="ml-2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </>
  )
}

export default Messages
