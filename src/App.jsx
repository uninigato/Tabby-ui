import AppRoutes from "./Routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./Components/Navbar";
import { Box } from "@mui/material";
import { useNotifications } from "./Context/NotificationsContext";
import { useMessages } from "./Context/MessagesContext";
import { useLocation } from "react-router-dom";

export default function App() {
  const { unreadCount: activityCount } = useNotifications();
  const { unreadCount: messagesCount } = useMessages();
  const AUTH_PAGES = ["/login", "/sign-up"];
  const { pathname } = useLocation();
  const showNavbar = !AUTH_PAGES.includes(pathname);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Toaster position="top-right" />

      {showNavbar && <Navbar counts={{ activity: activityCount, messages: messagesCount }} />}

      <Box component="main" sx={{ flex: 1, minWidth: 0, height: "100%" }}>
        <AppRoutes />
      </Box>
    </Box>
  )
}