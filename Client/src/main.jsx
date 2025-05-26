import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./Routes/Route.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { ChatProvider } from "./Context/ChatContext.jsx";

createRoot(document.getElementById("root")).render(

    <AuthProvider>
      <ChatProvider>
        <Router />
      </ChatProvider>
    </AuthProvider>

);
