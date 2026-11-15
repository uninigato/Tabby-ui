import { createContext, useContext, useEffect, useState } from "react";
import { HttpTransportType, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
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
      // The default policy gives up after about 40 seconds. This one retries forever.
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (ctx) => Math.min(1000 * (ctx.previousRetryCount + 1), 10000),
      })
      .configureLogging(LogLevel.Information)
      .build();

    // A background tab can fall behind on its timers, so give the server more time to answer
    conn.serverTimeoutInMilliseconds = 120000;

    let cancelled = false;

    // The automatic reconnect only covers a connection that dropped after it opened,
    // so if the very first start fails (the API is still booting), retry it here
    const startWithRetry = async () => {
      while (!cancelled) {
        try {
          await conn.start();
          if (!cancelled) setConnection(conn);
          return;
        } catch (err) {
          console.error("SignalR start failed, retrying:", err);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    };
    startWithRetry();

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