import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useRealtime } from "./RealtimeContext";
import * as api from "../Services/Notifications"

const NotificationsContext = createContext(null)

// The sentence for a notification. The server only sends who/what/where,
export function notificationText(n) {
  if (n.type === "SharePaid") return `${n.actor.fullTag} paid on ${n.receiptTitle}`;
  if (n.type === "AddedToReceipt") return `${n.actor.fullTag} added you to ${n.receiptTitle}`;
  return "New activity";
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const { connection } = useRealtime();
  const [notifications, setNotifications] = useState([]);

  // Load my notifications when I log in, clear them when I log out
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let cancelled = false;
    api
      .getNotifications()
      .then((list) => {
        if (!cancelled) setNotifications(list);
      })
      .catch((err) => console.error("Could not load notifications:", err));

    return () => {
      cancelled = true;
    };
  }, [user?.userId]);

  // New notifications pushed by the server
  useEffect(() => {
    if (!connection) return;

    const onNotification = (n) => {
      setNotifications((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
      toast(notificationText(n));
    };

    connection.on("ReceiveNotification", onNotification);
    return () => connection.off("ReceiveNotification", onNotification);
  }, [connection]);

  const markRead = async (id) => {
    try {
      await api.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);