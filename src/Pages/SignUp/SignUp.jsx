import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";

export const SignUp = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null); // filled with the API response on success

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    // Same rules the backend enforces, so users get feedback before sending anything
    const usernameOk = /^[a-zA-Z0-9_]{3,20}$/.test(form.username);
    const emailOk = /^\S+@\S+\.\S+$/.test(form.email);
    const passwordOk = form.password.length >= 6 && form.password.length <= 100;
    const formOk = usernameOk && emailOk && passwordOk;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formOk || loading) return;

        setError("");
        setLoading(true);
        try {
        const data = await register(form.username.trim(), form.email.trim(), form.password);
        setCreated(data);
        } catch (err) {
        toast.error(err.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                p: 2,
            }}
            >
            <Paper variant="outlined" sx={{ width: "100%", maxWidth: 400, p: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}>
                    Tabby
                </Typography>

                {created ? (
                // Success: show the generated tag, because friends need it to find you
                <Box>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                        Welcome, {created.username}!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Your tag is
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
                        {created.fullTag}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Share it with your friends so they can add you.
                    </Typography>
                    <Button fullWidth variant="contained" onClick={() => navigate("/friends")}>
                        Continue
                    </Button>
                </Box>
                ) : (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Create your account
                    </Typography>

                    <TextField
                        fullWidth
                        autoFocus
                        label="Username"
                        value={form.username}
                        onChange={update("username")}
                        error={form.username.length > 0 && !usernameOk}
                        helperText={
                            form.username.length > 0 && !usernameOk
                            ? "3-20 characters: letters, numbers and underscores"
                            : ""
                        }
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={update("email")}
                        error={form.email.length > 0 && !emailOk}
                        helperText={form.email.length > 0 && !emailOk ? "Enter a valid email" : " "}
                        sx={{ mb: 1 }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={update("password")}
                        error={form.password.length > 0 && !passwordOk}
                        helperText={
                            form.password.length > 0 && !passwordOk
                            ? "At least 6 characters"
                            : " "
                        }
                        sx={{ mb: 2 }}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={!formOk || loading}
                        >
                        {loading ? "Creating account..." : "Sign up"}
                    </Button>

                    <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
                        Already have an account?{" "}
                        <Link component={RouterLink} to="/login" underline="hover">
                            Log in
                        </Link>
                    </Typography>
                </Box>
                )}
            </Paper>
        </Box>
    );
}