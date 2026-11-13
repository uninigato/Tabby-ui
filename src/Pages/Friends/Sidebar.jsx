import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
  Chip
} from "@mui/material";
import { SearchIcon, PersonAddAltOutlinedIcon, CheckIcon, CloseIcon, PersonRemoveOutlinedIcon } from "../../Components/MUI/Icons";

const initials = (name) => name.slice(0, 2).toUpperCase();

function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ display: "block", px: 1.5, pt: 1.5, fontWeight: 700 }}
    >
      {children}
    </Typography>
  );
}

export const Sidebar = ({ friends = [], incoming = [], outgoing = [], selectedId, onSelect, onAddFriend, onAccept, onRemove, unreadByFriend = {} }) => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [removeOpen, setRemoveOpen] = useState(false);

  const askToRemove = (friend) => {
    setFriendToRemove(friend);
    setRemoveOpen(true);
  };

  const confirmRemove = () => {
    onRemove(friendToRemove.friendshipId);
    setRemoveOpen(false);
  };

  const visibleFriends = friends.filter((f) =>
    f.fullTag.toLowerCase().includes(search.trim().toLowerCase())
  );

  // must look like username#1234
  const tagIsValid = /^[^#\s]+#\d{4}$/.test(tagInput.trim());

  const closeDialog = () => {
    setDialogOpen(false);
    setTagInput("");
  };

  const handleSend = () => {
    onAddFriend?.(tagInput.trim());
    closeDialog();
  };

  return (
    <Box
      sx={{
        width: 300,
        height: "100%",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      {/* Top section: title, add button, search */}
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Friends
          </Typography>
          <Tooltip title="Add friend">
            <IconButton color="primary" onClick={() => setDialogOpen(true)}>
              <PersonAddAltOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search friends"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mt: 1.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Everything below the top section scrolls on its own */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 1 }}>
        {/* Requests people sent you */}
        {incoming.length > 0 && (
          <>
            <SectionLabel>Requests</SectionLabel>
            <List disablePadding>
              {incoming.map((req) => (
                <ListItem
                  key={req.friendshipId}
                  sx={{ borderRadius: 2 }}
                  secondaryAction={
                    <>
                      <Tooltip title="Accept">
                        <IconButton color="secondary" onClick={() => onAccept(req.friendshipId)}>
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Decline">
                        <IconButton onClick={() => onRemove(req.friendshipId)}>
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.light", width: 36, height: 36, fontSize: 14 }}>
                      {initials(req.user.username)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={req.user.username}
                    secondary={`#${req.user.tag}`}
                    slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                    
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Requests you sent */}
        {outgoing.length > 0 && (
          <>
            <SectionLabel>Sent</SectionLabel>
            <List disablePadding>
              {outgoing.map((req) => (
                <ListItem
                  key={req.friendshipId}
                  sx={{ borderRadius: 2 }}
                  secondaryAction={
                    <Tooltip title="Cancel request">
                      <IconButton onClick={() => onRemove(req.friendshipId)}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "grey.400", width: 36, height: 36, fontSize: 14 }}>
                      {initials(req.user.username)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={req.user.username}
                    secondary={`#${req.user.tag} · pending`}
                    slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Your friends */}
        {(incoming.length > 0 || outgoing.length > 0) && <SectionLabel>Friends</SectionLabel>}
        <List disablePadding>
                    {visibleFriends.map((friend) => (
            <ListItem
              key={friend.userId}
              disablePadding
              sx={{
                mb: 0.25,
                "& .unfriend": { opacity: 0 },
                "&:hover .unfriend, & .unfriend:focus-visible": { opacity: 1, color: "red" },
              }}
              secondaryAction={
                <Tooltip title="Remove friend">
                  <IconButton className="unfriend" size="small" onClick={() => askToRemove(friend)}>
                    <PersonRemoveOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemButton
                selected={friend.userId === selectedId}
                onClick={() => onSelect(friend.userId)}
                sx={{ borderRadius: 2, pr: 6 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.light", width: 36, height: 36, fontSize: 14 }}>
                    {initials(friend.username)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={friend.username}
                  slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                />
                {unreadByFriend[friend.userId] > 0 && (
                  <Chip size="small" color="primary" label={unreadByFriend[friend.userId]} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {visibleFriends.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
            {friends.length === 0 ? "No friends yet. Add someone!" : "No matches."}
          </Typography>
        )}
      </Box>

      {/* Add friend modal */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>Add friend</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Username#tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tagIsValid && handleSend()}
            error={tagInput.length > 0 && !tagIsValid}
            helperText={tagInput.length > 0 && !tagIsValid ? "Use the format username#1234" : " "}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" disabled={!tagIsValid} onClick={handleSend}>
            Send request
          </Button>
        </DialogActions>
      </Dialog>

            {/* Remove friend confirmation */}
      <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Remove friend</DialogTitle>
        <DialogContent>
          <Typography>
            Remove {friendToRemove?.fullTag} from your friends? You won't be able to message each
            other until you add each other again. Receipts you share stay as they are.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRemoveOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmRemove}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}