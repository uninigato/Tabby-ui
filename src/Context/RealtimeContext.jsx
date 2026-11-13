import { createContext, useContext, useEffect, useState } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import { getToken } from "../Services/Client";
import { useAuth } from "./AuthContext";

const RealtimeContext = createContext({ connection: null });

export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    if (!user) return; // not logged in, nothing to connect

    const conn = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat`, {
          accessTokenFactory: () => getToken() ?? "",
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
      .withAutomaticReconnect()
      .build();

    let cancelled = false;

    conn
      .start()
      .then(() => {
        if (!cancelled) setConnection(conn);
      })
      .catch((err) => {
        if (!cancelled) console.error("SignalR connection failed:", err);
      });

    return () => {
      cancelled = true;
      setConnection(null);
      conn.stop();
    };
  }, [user?.userId]);

  return (
    <RealtimeContext.Provider value={{ connection }}>{children}</RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);