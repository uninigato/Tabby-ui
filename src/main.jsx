import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { Theme } from './Components/MUI/Theme.js'
import CssBaseline from "@mui/material/CssBaseline";
import App from './App.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import { RealtimeProvider } from "./Context/RealtimeContext";
import { NotificationsProvider } from './Context/NotificationsContext.jsx'
import { MessagesProvider } from "./Context/MessagesContext";
import { FriendsProvider } from './Context/FriendsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={Theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <RealtimeProvider>
            <NotificationsProvider>
              <MessagesProvider>
                <FriendsProvider>
                  <App />
                </FriendsProvider>
              </MessagesProvider>
            </NotificationsProvider>
          </RealtimeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
