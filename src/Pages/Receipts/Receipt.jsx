import { Box, Checkbox, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { DeleteOutlineIcon } from "../../Components/MUI/Icons";
import { formatMoney } from "../../Utils";

function GroupLabel({ children }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ display: "block", fontWeight: 700, lineHeight: 1.8 }}
    >
      {children}
    </Typography>
  );
}

export const Receipt = ({receipt, currentUserId, onTogglePaid, onDelete}) => {
    const isPayer = receipt.paidBy.userId === currentUserId;

    // The creator is owed money, so they never appear in the lists below
    const people = receipt.shares.filter((s) => s.user.userId !== receipt.paidBy.userId);
    const toPay = people.filter((s) => !s.isPaid);
    const paid = people.filter((s) => s.isPaid);

    const renderRow = (share) => {
        const isMe = share.user.userId === currentUserId;
        const canToggle = isPayer || isMe;

        return (
        <Box key={share.shareId} sx={{ display: "flex", alignItems: "center" }}>
            <Typography
                noWrap
                sx={{ flex: 1, minWidth: 0, color: share.isPaid ? "text.secondary" : "text.primary" }}
                >
                {share.user.username}
                {isMe && " (you)"}
            </Typography>
            <Typography sx={{ ml: 1, color: share.isPaid ? "text.secondary" : "text.primary" }}>
                {formatMoney(share.amount)}
            </Typography>
            <Tooltip title={canToggle ? "" : "Only the payer or this person can change this"}>
            <span>
                <Checkbox
                size="small"
                color="secondary"
                checked={share.isPaid}
                disabled={!canToggle}
                onChange={() => onTogglePaid(receipt, share)}
                />
            </span>
            </Tooltip>
        </Box>
        );
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                borderLeft: 6,
                borderLeftColor: "primary.main",
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
            }}
        >
            {/* What it's for and how much */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
                    {receipt.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                    paid by {receipt.paidBy.username} · {new Date(receipt.createdAt).toLocaleDateString()}
                </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {formatMoney(receipt.totalAmount)}
                </Typography>
                {isPayer && (
                    <Tooltip title="Delete receipt">
                    <IconButton size="small" onClick={() => onDelete(receipt)} sx={{ ml: 0.5 }}>
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                    </Tooltip>
                )}
                </Box>
            </Box>

            {/* Who still has to pay */}
            <Box>
                <GroupLabel>To pay ({toPay.length})</GroupLabel>
                {toPay.length > 0 ? (
                toPay.map(renderRow)
                ) : (
                <Typography variant="body2" sx={{ color: "secondary.main", fontWeight: 600 }}>
                    Everyone has paid
                </Typography>
                )}
            </Box>

            {/* Who already has */}
            {paid.length > 0 && (
                <Box>
                <GroupLabel>Paid ({paid.length})</GroupLabel>
                {paid.map(renderRow)}
                </Box>
            )}
        </Paper>
    );
}