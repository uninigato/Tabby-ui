import { useAuth } from "./AuthContext";
import { useRealtime } from "./RealtimeContext";
import * as api from "../Services/Friends"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const FriendsContext = createContext(null);

export function FriendsProvider({ children }) {
  const { user } = useAuth();
  const { connection } = useRealtime();

  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const loadId = useRef(0); // lets us ignore an answer that arrives after a newer request or a logout

  const reload = useCallback(async () => {
    const id = ++loadId.current;
    try {
      const overview = await api.getFriendsOverview();
      if (id !== loadId.current) return;
      setFriends(overview.friends);
      setIncoming(overview.incoming);
      setOutgoing(overview.outgoing);
    } catch (err) {
      console.error("Could not load friends:", err);
    }
  }, []);

  // Load when I log in, clear everything when I log out
  useEffect(() => {
    if (!user) {
      loadId.current++; // drops any request still in flight
      setFriends([]);
      setIncoming([]);
      setOutgoing([]);
      return;
    }
    reload();
  }, [user?.userId, reload]);

  // Changes pushed by the server, wherever I am in the app
  useEffect(() => {
    if (!connection) return;

    const onFriendsChanged = ({ kind, user: other }) => {
      reload();

      if (kind === "RequestReceived") toast(`${other.fullTag} sent you a friend request`);
      if (kind === "RequestAccepted") toast(`${other.fullTag} accepted your friend request`);
    };

    connection.on("FriendsChanged", onFriendsChanged);
    return () => connection.off("FriendsChanged", onFriendsChanged);
  }, [connection, reload]);

  const sendRequest = async (fullTag) => {
    try {
      const result = await api.sendFriendRequest(fullTag);
      toast.success(result.message);
      reload(); // sending can also accept a request they'd sent me
    } catch (err) {
      toast.error(err.message);
    }
  };

  const accept = async (friendshipId) => {
    try {
      await api.acceptFriendRequest(friendshipId);
      toast.success("Friend request accepted.");
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Declining an incoming request and cancelling an outgoing one are the same call
  const remove = async (friendshipId) => {
    try {
      await api.removeFriendship(friendshipId);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <FriendsContext.Provider value={{ friends, incoming, outgoing, sendRequest, accept, remove }}>
      {children}
    </FriendsContext.Provider>
  );
}

export const useFriends = () => useContext(FriendsContext);