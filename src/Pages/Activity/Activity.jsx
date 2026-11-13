import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { notificationText, useNotifications } from "../../Context/NotificationsContext";
import { DoneAllIcon } from "../../Components/MUI/Icons";

const formatDate = (iso) =>
  new Date(iso).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  export const Activity = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

    const handleOpen = (n) => {
        if (!n.isRead) markRead(n.id);
        navigate("/receipts");
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <Box
                sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                py: 1.5,
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Activity
                </Typography>
                <Button startIcon={<DoneAllIcon />} disabled={unreadCount === 0} onClick={markAllRead}>
                Mark all as read
                </Button>
            </Box>

            {/* The list, scrolls on its own */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
                {notifications.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: "center", mt: 6 }}>
                    Nothing yet. You'll see it here when someone pays you.
                </Typography>
                ) : (
                <List sx={{ maxWidth: 640, mx: "auto" }}>
                    {notifications.map((n) => (
                    <ListItemButton
                        key={n.id}
                        onClick={() => handleOpen(n)}
                        sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        bgcolor: n.isRead ? "transparent" : "action.selected",
                        }}
                    >
                        <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.light", width: 36, height: 36, fontSize: 14 }}>
                            {n.actor.username.slice(0, 2).toUpperCase()}
                        </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                        primary={notificationText(n)}
                        secondary={formatDate(n.createdAt)}
                        slotProps={{ primary: { sx: { fontWeight: n.isRead ? 400 : 700 } } }}
                        />
                        {!n.isRead && (
                        <Box
                            sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main", ml: 1 }}
                        />
                        )}
                    </ListItemButton>
                    ))}
                </List>
                )}
            </Box>
        </Box>
    );
  }