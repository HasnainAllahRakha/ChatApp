import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, UserX } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import { useChat } from "../../Context/ChatContext";

import { User_Search, Chat_Create } from "../../url";

import ConfirmationDialog from "../../Components/UI/Confirmation-dialog";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateChatDialog, setShowCreateChatDialog] = useState(false);
  const [showExistingChatDialog, setShowExistingChatDialog] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const searchRef = useRef(null);

  const { user } = useAuth();
  const { selectedChat, setSelectedChat, chats, addChat } = useChat();

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setIsResultsOpen(false);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    // Debounce search requests
    const timer = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users from the backend
  const fetchUsers = async (query) => {
    try {
      const config = {
        headers: {
          Authorization: `bearer ${user?.token}`,
        },
      };

      const response = await axios.get(
        `${User_Search}?search=${query}`,
        config
      );
      setSearchResults(response.data);
      setIsResultsOpen(true);
      setIsSearching(false);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to fetch users. Please try again.");
      setIsSearching(false);
    }
  };

  // Handle user selection and chat creation
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowCreateChatDialog(true);
    setIsResultsOpen(false);
  };

  // Create or access chat with selected user
  const createChat = async () => {
    if (!selectedUser) return;

    setIsCreatingChat(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${user?.token}`,
        },
      };

      // Check if we already have a chat with this user in our local state
      const existingChat = chats.find((c) =>
        c.users.some((u) => u._id === selectedUser._id)
      );

      if (existingChat) {
        // We already have this chat locally
        setIsCreatingChat(false);
        setShowCreateChatDialog(false);
        setShowExistingChatDialog(true);
        return;
      }

      // No existing chat found locally, call the API
      const { data } = await axios.post(
        `${Chat_Create}`,
        { userId: selectedUser._id },
        config
      );

      // Check if this chat was just created or already existed on the server
      // The backend returns an array for existing chats and a single object for new chats
      const chatAlreadyExisted = Array.isArray(data) && data.length > 0;

      if (chatAlreadyExisted) {
        // Chat already existed on the server
        const existingChat = data[0];
        addChat(existingChat);
        setShowCreateChatDialog(false);
        setShowExistingChatDialog(true);
      } else {
        // This is a new chat
        addChat(data);
        setSelectedChat(data);
        setShowCreateChatDialog(false);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // View existing chat
  const viewExistingChat = () => {
    // Find the chat with this user
    const chatWithUser = chats.find((c) =>
      c.users.some((u) => u._id === selectedUser._id)
    );

    if (chatWithUser) {
      setSelectedChat(chatWithUser);
    }
    setShowExistingChatDialog(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsResultsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="relative flex-1 max-w-md w-full" ref={searchRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setIsResultsOpen(true);
            }}
            placeholder="Search users..."
            className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setIsResultsOpen(false);
                setError(null);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {isResultsOpen && searchQuery.trim() !== "" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10 max-h-80 overflow-y-auto"
            >
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"
                  />
                  Searching...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <p>{error}</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <UserX size={32} className="mx-auto mb-2 text-gray-400" />
                  <p>No users found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <ul className="py-1">
                  {searchResults.map((user) => (
                    <li key={user._id}>
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-4 py-2 flex items-center hover:bg-gray-100 text-left"
                      >
                        <img
                          src="User.jpg"
                          alt={user.name}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Chat Dialog */}
      <ConfirmationDialog
        isOpen={showCreateChatDialog}
        onClose={() => setShowCreateChatDialog(false)}
        onConfirm={createChat}
        title="Start a new conversation"
        message={`Would you like to start a conversation with ${selectedUser?.name}?`}
        confirmText={isCreatingChat ? "Creating..." : "Yes, start chat"}
        cancelText="Cancel"
        type="question"
      />

      {/* Existing Chat Dialog */}
      <ConfirmationDialog
        isOpen={showExistingChatDialog}
        onClose={() => setShowExistingChatDialog(false)}
        onConfirm={viewExistingChat}
        title="Chat already exists"
        message={`You already have a conversation with ${selectedUser?.name}. Would you like to view it?`}
        confirmText="Yes, view chat"
        cancelText="Not now"
        type="success"
      />
    </>
  );
}
