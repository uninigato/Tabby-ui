import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useRealtime } from "./RealtimeContext";
import { getFriendsOverview } from "../Services/Friends";
import { getUnreadCounts, markConversationRead } from "../Services/Messages";

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const { user } = useAuth();
  const { connection } = useRealtime();

  const [counts, setCounts] = useState({}); // { [friendId]: number of unread messages }
  const activeChatRef = useRef(null); // the friend whose chat is open right now
  const namesRef = useRef(new Map()); // userId -> "username#tag", for the toast

  // Load the starting counts when I log in, clear everything when I log out
  useEffect(() => {
    if (!user) {
      setCounts({});
      namesRef.current.clear();
      return;
    }

    let cancelled = false;
    getUnreadCounts()
      .then((list) => {
        if (!cancelled) setCounts(Object.fromEntries(list.map((x) => [x.friendId, x.count])));
      })
      .catch((err) => console.error("Could not load unread counts:", err));

    return () => {
      cancelled = true;
    };
  }, [user?.userId]);

  // Messages pushed by the server, wherever I am in the app
  useEffect(() => {
    if (!connection || !user) return;

    // A live message only carries ids, so look the sender's tag up when we need it
    const nameOf = async (userId) => {
      if (!namesRef.current.has(userId)) {
        try {
          const overview = await getFriendsOverview();
          overview.friends.forEach((f) => namesRef.current.set(f.userId, f.fullTag));
        } catch {
          // fall through to the generic name
        }
      }
      return namesRef.current.get(userId) ?? "A friend";
    };

    const onMessage = async (m) => {
      if (m.senderId === user.userId) return; // my own message, echoed back

      // I'm looking at that chat: nothing to count, just keep it marked as read
      if (m.senderId === activeChatRef.current) {
        markConversationRead(m.senderId).catch(() => {});
        return;
      }

      setCounts((prev) => ({ ...prev, [m.senderId]: (prev[m.senderId] ?? 0) + 1 }));
      toast(`${await nameOf(m.senderId)}: ${m.content}`);
    };

    connection.on("ReceiveDirectMessage", onMessage);
    return () => connection.off("ReceiveDirectMessage", onMessage);
  }, [connection, user?.userId]);

  // The Friends page calls this when a chat is opened...
  const openChat = useCallback((friendId) => {
    activeChatRef.current = friendId;
    setCounts((prev) => {
      if (!prev[friendId]) return prev;
      const next = { ...prev };
      delete next[friendId];
      return next;
    });
    markConversationRead(friendId).catch((err) => console.error("Could not mark as read:", err));
  }, []);

  // ...and this when it's closed or the page is left
  const closeChat = useCallback(() => {
    activeChatRef.current = null;
  }, []);

  const unreadCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <MessagesContext.Provider value={{ unreadCount, unreadByFriend: counts, openChat, closeChat }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = () => useContext(MessagesContext);