import { createTheme } from "@mui/material/styles"

export const Theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#5b5fc7" },
    secondary: { main: "#13a10e" },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    divider: "#e1e1e1",
    text: {
      primary: "#242424",
      secondary: "#616161",
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Segoe UI", "Inter", system-ui, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});