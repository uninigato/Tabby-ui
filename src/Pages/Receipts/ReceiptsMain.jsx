import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import { useFriends } from "../../Context/FriendsContext";
import { AddIcon } from "../../Components/MUI/Icons";
import { createReceipt, deleteReceipt, getReceipts, setSharePaid  } from "../../Services/Receipts";
import { Receipt } from "./Receipt";
import { NewReceipt } from "./NewReceipt";
import { useRealtime } from "../../Context/RealtimeContext";

export const Receipts = () => {
    const { user } = useAuth();
    const { friends } = useFriends();
    const { connection } = useRealtime();

    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Load the receipts once
    useEffect(() => {
        getReceipts()
        .then(setReceipts)
        .catch((err) => toast.error(err.message))
        .finally(() => setLoading(false));
    }, []);

    // Changes pushed by the server: someone added me, ticked a share, or deleted a receipt
    useEffect(() => {
        if (!connection) return;

        const onChanged = (receipt) => upsertReceipt(receipt);
        const onDeleted = ({ id }) => setReceipts((prev) => prev.filter((r) => r.id !== id));

        connection.on("ReceiptChanged", onChanged);
        connection.on("ReceiptDeleted", onDeleted);
        return () => {
        connection.off("ReceiptChanged", onChanged);
        connection.off("ReceiptDeleted", onDeleted);
        };
    }, [connection]);

    // Replaces a receipt if we already have it, otherwise adds it at the top
    const upsertReceipt = (receipt) =>
        setReceipts((prev) =>
        prev.some((r) => r.id === receipt.id)
            ? prev.map((r) => (r.id === receipt.id ? receipt : r))
            : [receipt, ...prev]
        );

    // Returns true on success so the modal knows whether it may close
    const handleCreate = async (title, total, friendIds, includeMyShare) => {
        try {
        const created = await createReceipt(
            title,
            total,
            friendIds.map((userId) => ({ userId })),
            includeMyShare
        );
        upsertReceipt(created);
        return true;
        } catch (err) {
        toast.error(err.message);
        return false;
        }
    };

    const handleTogglePaid = async (receipt, share) => {
        try {
        // The server answers with the whole updated receipt, so we swap it in
        const updated = await setSharePaid(receipt.id, share.shareId, !share.isPaid);
        upsertReceipt(updated);
        } catch (err) {
        toast.error(err.message);
        }
    };

    const handleDelete = async (receipt) => {
        if (!window.confirm(`Delete "${receipt.title}"? This can't be undone.`)) return;

        try {
        await deleteReceipt(receipt.id);
        setReceipts((prev) => prev.filter((r) => r.id !== receipt.id));
        } catch (err) {
        toast.error(err.message);
        }
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
            Receipts
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New receipt
            </Button>
        </Box>

        {/* The grid, scrolls on its own */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            {!loading && receipts.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", mt: 6 }}>
                No receipts yet. Create one!
            </Typography>
            ) : (
            <Box
                sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 2,
                alignItems: "start",
                }}
            >
                {receipts.map((receipt) => (
                <Receipt
                    key={receipt.id}
                    receipt={receipt}
                    currentUserId={user.userId}
                    onTogglePaid={handleTogglePaid}
                    onDelete={handleDelete}
                />
                ))}
            </Box>
            )}
        </Box>

        <NewReceipt
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            friends={friends}
            onCreate={handleCreate}
        />
        </Box>
    );
}