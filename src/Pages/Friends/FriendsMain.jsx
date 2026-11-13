import { useEffect, useRef, useState } from "react";
import { Avatar, Box, IconButton, InputBase, Paper, Typography } from "@mui/material";
import { SendIcon } from "../../Components/MUI/Icons";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import { getConversation, sendMessage } from "../../Services/Messages";
import { Sidebar } from "./Sidebar"
import { formatTime } from "../../Utils"
import { useRealtime } from "../../Context/RealtimeContext";
import { useMessages } from "../../Context/MessagesContext";
import { useFriends } from "../../Context/FriendsContext";

export const Friends = () => {
    const { user } = useAuth();
    const { connection } = useRealtime();
    const { openChat, closeChat, unreadByFriend } = useMessages();

    const [selectedId, setSelectedId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const { friends, incoming, outgoing, sendRequest, accept, remove } = useFriends();
    const selectedFriend = friends.find((f) => f.userId === selectedId);

  // If the selected friend disappears (I removed them, or they removed me), close the chat
  useEffect(() => {
    if (selectedId !== null && !friends.some((f) => f.userId === selectedId)) {
      setSelectedId(null);
    }
  }, [friends, selectedId]);

    // Load the conversation whenever a different friend is selected
    useEffect(() => {
        if (selectedId === null) return;

        let cancelled = false; // ignore the answer if the user clicked someone else meanwhile
        getConversation(selectedId)
        .then((data) => {
            if (!cancelled) setMessages(data);
        })
        .catch((err) => {
            if (!cancelled) toast.error(err.message);
        })
        .finally(() => {
            if (!cancelled) setLoadingMessages(false);
        });

        return () => {
        cancelled = true;
        };
    }, [selectedId]);

    // Keep the newest message in view
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: "end" });
    }, [messages.length, selectedId]);

      // Friend requests and changes pushed by the server
    useEffect(() => {
        if (!connection) return;

        const onFriendsChanged = ({ kind, user: other }) => {
        loadFriends(); // reload the three lists from the server

        if (kind === "RequestReceived") toast(`${other.fullTag} sent you a friend request`);
        if (kind === "RequestAccepted") toast(`${other.fullTag} accepted your friend request`);
        };

        connection.on("FriendsChanged", onFriendsChanged);
        return () => connection.off("FriendsChanged", onFriendsChanged);
    }, [connection]);

    const handleSelect = (id) => {
        if (id === selectedId) return;
        setMessages([]);
        setLoadingMessages(true);
        setSelectedId(id);
    };

    // Skips a message that's already in the list (the live connection will need this)
    const addMessage = (message) =>
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));

      // Messages pushed by the server
        useEffect(() => {
            if (!connection) return;

            const onMessage = (m) => {
            const other = m.senderId === user.userId ? m.recipientId : m.senderId;
            if (other === selectedId) addMessage(m); // skips duplicates by id
            };

            connection.on("ReceiveDirectMessage", onMessage);
            return () => connection.off("ReceiveDirectMessage", onMessage);
        }, [connection, selectedId, user.userId]);

      // Tell the messages context which chat is open (this also marks it as read)
        useEffect(() => {
            if (selectedId === null) return;

            openChat(selectedId);
            return closeChat; // runs when another friend is picked or the page is left
        }, [selectedId, openChat, closeChat]);


    const handleAddFriend = async (fullTag) => {
        try {
        const result = await sendFriendRequest(fullTag);
        toast.success(result.message);
        loadFriends(); // in case sending it also accepted a request they'd sent you
        } catch (err) {
        toast.error(err.message);
        }
    };

      const handleAccept = async (friendshipId) => {
        try {
        await acceptFriendRequest(friendshipId);
        toast.success("Friend request accepted.");
        loadFriends();
        } catch (err) {
        toast.error(err.message);
        }
    };

    // Declining an incoming request and cancelling an outgoing one are the same call
    const handleRemove = async (friendshipId) => {
        try {
        await removeFriendship(friendshipId);
        loadFriends();
        } catch (err) {
        toast.error(err.message);
        }
    };

    const handleSend = async () => {
        const content = text.trim();
        if (!content || sending) return;

        setSending(true);
        try {
        const saved = await sendMessage(selectedId, content);
        addMessage(saved);
        setText("");
        } catch (err) {
        toast.error(err.message);
        } finally {
        setSending(false);
        }
    };

    return (
        <Box sx={{ display: "flex", height: "100%" }}>
        <Sidebar
            friends={friends}
            incoming={incoming}
            outgoing={outgoing}
            selectedId={selectedId}
            onSelect={handleSelect}
            onAddFriend={sendRequest}
            onAccept={accept}
            onRemove={remove}
            unreadByFriend={unreadByFriend}
        />

        {/* Chat pane */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
            {!selectedFriend ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="text.secondary">Select a friend to start chatting</Typography>
            </Box>
            ) : (
            <>
                {/* Header */}
                <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 3,
                    py: 1.5,
                    bgcolor: "background.paper",
                    borderBottom: 1,
                    borderColor: "divider",
                }}
                >
                <Avatar sx={{ bgcolor: "primary.light", width: 36, height: 36, fontSize: 14 }}>
                    {selectedFriend.username.slice(0, 2).toUpperCase()}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedFriend.username}
                </Typography>
                </Box>

                {/* Messages, scrolls on its own */}
                <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 3,
                    py: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                }}
                >
                {!loadingMessages && messages.length === 0 && (
                    <Typography color="text.secondary" sx={{ m: "auto" }}>
                    No messages yet. Say hi!
                    </Typography>
                )}

                {messages.map((m) => {
                    const mine = m.senderId === user.userId;
                    return (
                    <Box
                        key={m.id}
                        sx={{
                        alignSelf: mine ? "flex-end" : "flex-start",
                        maxWidth: "65%",
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 2,
                        bgcolor: mine ? "primary.main" : "background.paper",
                        color: mine ? "primary.contrastText" : "text.primary",
                        border: mine ? 0 : 1,
                        borderColor: "divider",
                        }}
                    >
                        <Typography sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                        {m.content}
                        </Typography>
                        <Typography
                        variant="caption"
                        sx={{ opacity: 0.7, display: "block", textAlign: "right" }}
                        >
                        {formatTime(m.sentAt)}
                        </Typography>
                    </Box>
                    );
                })}
                <div ref={bottomRef} />
                </Box>

                {/* Input */}
                <Box sx={{ px: 3, pb: 2, pt: 1 }}>
                <Paper
                    variant="outlined"
                    sx={{ display: "flex", alignItems: "center", px: 1.5, py: 0.5 }}
                >
                    <InputBase
                    fullWidth
                    placeholder="Type a message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <IconButton
                    color="primary"
                    disabled={!text.trim() || sending}
                    onClick={handleSend}
                    >
                    <SendIcon />
                    </IconButton>
                </Paper>
                </Box>
            </>
            )}
        </Box>
        </Box>
    );
}