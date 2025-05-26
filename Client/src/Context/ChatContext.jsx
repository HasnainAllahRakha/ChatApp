import { createContext, useContext, useState } from "react"

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null)
  const [chats, setChats] = useState([])

  // Function to add a new chat to the list
  const addChat = (newChat) => {
    // Check if chat already exists in the list
    const chatExists = chats.find((c) => c._id === newChat._id)
    if (!chatExists) {
      setChats([newChat, ...chats])
    }
  }

  // Function to update an existing chat
  const updateChat = (updatedChat) => {
    setChats(chats.map((c) => (c._id === updatedChat._id ? updatedChat : c)))
  }

  // Function to remove a chat
  const removeChat = (chatId) => {
    setChats(chats.filter((c) => c._id !== chatId))
  }

  return (
    <ChatContext.Provider value={{ selectedChat, setSelectedChat, chats, setChats, addChat, updateChat, removeChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
