import { createContext, useContext, useEffect, useState } from "react";
import { clearToken, getToken, setUnauthorizedHandler } from "../Services/Client";
import * as authApi from "../Services/Auth"

const AuthContext = createContext(null);

// Keep only the profile fields, never the token
const toUser = (data) => ({
  userId: data.userId,
  username: data.username,
  tag: data.tag,
  fullTag: data.fullTag,
  email: data.email,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token is saved, we're "loading" until the server confirms who it belongs to
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = () => {
    clearToken();
    setUser(null);
  };

  useEffect(() => {
    // Client.js calls this when the server rejects our token (expired or invalid)
    setUnauthorizedHandler(logout);

    if (!getToken()) return;

    authApi
      .getMe()
      .then((me) => setUser(toUser(me)))
      .catch(logout)
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(toUser(data));
    return data;
  };

  const register = async (username, email, password) => {
    const data = await authApi.register(username, email, password);
    setUser(toUser(data));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);