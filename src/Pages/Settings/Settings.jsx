import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Avatar, Box, Button, Paper, TextField, Typography} from "@mui/material"
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import { changePassword } from "../../Services/Auth";
import { LogoutIcon } from "../../Components/MUI/Icons";

export const Settings = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [form, setForm] = useState({ current: "", next: "", confirm: "" });
    const [saving, setSaving] = useState(false);

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const nextOk = form.next.length >= 6 && form.next.length <= 100;
    const matches = form.next === form.confirm;
    const formOk = form.current !== "" && nextOk && matches;

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!formOk || saving) return;

        setSaving(true);
        try {
            await changePassword(form.current, form.next);
            toast.success("Password changed.");
            setForm({ current: "", next: "", confirm: "" });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <Box
                sx={{
                px: 3,
                py: 1.5,
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Settings
                </Typography>
            </Box>

            {/* Content, scrolls on its own */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
                <Box sx={{ maxWidth: 560, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Profile */}
                <Paper variant="outlined" sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, fontSize: 20 }}>
                        {user.username.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {user.fullTag}
                        </Typography>
                        <Typography color="text.secondary" noWrap>
                            {user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Friends add you with your tag
                        </Typography>
                    </Box>
                </Paper>

                {/* Change password */}
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Change password
                    </Typography>

                    <Box component="form" onSubmit={handleChangePassword} noValidate>
                    <TextField
                        fullWidth
                        label="Current password"
                        type="password"
                        autoComplete="current-password"
                        value={form.current}
                        onChange={update("current")}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="New password"
                        type="password"
                        autoComplete="new-password"
                        value={form.next}
                        onChange={update("next")}
                        error={form.next.length > 0 && !nextOk}
                        helperText={form.next.length > 0 && !nextOk ? "At least 6 characters" : " "}
                        sx={{ mb: 1 }}
                    />

                    <TextField
                        fullWidth
                        label="Confirm new password"
                        type="password"
                        autoComplete="new-password"
                        value={form.confirm}
                        onChange={update("confirm")}
                        error={form.confirm.length > 0 && !matches}
                        helperText={form.confirm.length > 0 && !matches ? "Passwords don't match" : " "}
                        sx={{ mb: 2 }}
                    />

                    <Button type="submit" variant="contained" disabled={!formOk || saving}>
                        {saving ? "Saving..." : "Change password"}
                    </Button>
                    </Box>
                </Paper>

                {/* Log out */}
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Button color="error" variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
                    Log out
                    </Button>
                </Paper>
                </Box>
            </Box>
        </Box>
    );
}