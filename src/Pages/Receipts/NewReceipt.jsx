import { useState } from "react";
import { Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField, Typography } from "@mui/material";

export const NewReceipt = ({ open, onClose, friends = [], onCreate }) => {
    const [title, setTitle] = useState("");
    const [total, setTotal] = useState("");
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [includeMyShare, setIncludeMyShare] = useState(true);
    const [saving, setSaving] = useState(false);

    const formOk = title.trim() !== "" && Number(total) > 0 && selectedFriends.length > 0;

    const close = () => {
        setTitle("");
        setTotal("");
        setSelectedFriends([]);
        setIncludeMyShare(true);
        onClose();
    };

    const handleCreate = async () => {
        if (!formOk || saving) return;

        setSaving(true);
        // onCreate returns true on success, false if the server refused (the page shows the toast)
        const ok = await onCreate(
        title.trim(),
        Number(total),
        selectedFriends.map((f) => f.userId),
        includeMyShare
        );
        setSaving(false);

        if (ok) close();
    };

    return (
        <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
            <DialogTitle>New receipt</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    label="What is it for?"
                    placeholder="Groceries"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                    sx={{ mt: 1, mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="Total"
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                    sx={{ mb: 2 }}
                />

                <Autocomplete
                    multiple
                    options={friends}
                    value={selectedFriends}
                    onChange={(_, value) => setSelectedFriends(value)}
                    getOptionLabel={(friend) => friend.fullTag}
                    isOptionEqualToValue={(a, b) => a.userId === b.userId}
                    noOptionsText="No friends to add"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Who owes you?"
                            helperText={friends.length === 0 ? "Add some friends first" : " "}
                        />
                    )}
                />

                <FormControlLabel
                    sx={{ mt: 1 }}
                    control={
                        <Checkbox
                        checked={includeMyShare}
                        onChange={(e) => setIncludeMyShare(e.target.checked)}
                        />
                    }
                    label="Include my own share"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", ml: 4 }}>
                    {includeMyShare
                        ? "The total is divided between you and the people you pick."
                        : "The people you pick split the whole amount."}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={close}>Cancel</Button>
                <Button variant="contained" disabled={!formOk || saving} onClick={handleCreate}>
                {saving ? "Creating..." : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}