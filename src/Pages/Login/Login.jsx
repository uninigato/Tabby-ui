import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const formOk = form.email.trim() !== "" && form.password !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formOk || loading) return;

        setLoading(true);
        try {
        await login(form.email.trim(), form.password);
        navigate("/friends");
        } catch (err) {
        toast.error(err.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
            }}
        >
        <Paper variant="outlined" sx={{ width: "100%", maxWidth: 400, p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}>
            Tabby
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
            Log in to your account
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>

            <TextField
                fullWidth
                autoFocus
                label="Email"
                type="email"
                value={form.email}
                onChange={update("email")}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Password"
                type="password"
                value={form.password}
                onChange={update("password")}
                sx={{ mb: 2 }}
            />

            <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={!formOk || loading}
            >
                {loading ? "Logging in..." : "Log in"}
            </Button>
            </Box>

            <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            Don't have an account?{" "}
            <Link component={RouterLink} to="/sign-up" underline="hover">
                Sign up
            </Link>
            </Typography>
        </Paper>
        </Box>
    );
}