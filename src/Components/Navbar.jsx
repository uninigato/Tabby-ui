import { NavLink } from "react-router-dom"
import { Badge, Box, ButtonBase, Typography } from "@mui/material"
import { PeopleAltOutlinedIcon, ReceiptLongOutlinedIcon, NotificationsNoneOutlinedIcon, SettingsOutlinedIcon } from "./MUI/Icons"

const mainItems = [
  { to: "/friends", label: "Friends", icon: PeopleAltOutlinedIcon, badge: "messages" },
  { to: "/receipts", label: "Receipts", icon: ReceiptLongOutlinedIcon },
  { to: "/activity", label: "Activity", icon: NotificationsNoneOutlinedIcon, badge: "activity" },
];

const settingsItem = { to: "/settings", label: "Settings", icon: SettingsOutlinedIcon };

function NavItem({ to, label, icon: Icon, badgeCount = 0 }) {
  return (
    <ButtonBase
      component={NavLink}
      to={to}
      sx={{
        position: "relative",
        width: "100%",
        py: 1,
        flexDirection: "column",
        gap: 0.25,
        color: "text.secondary",
        "&:hover": { bgcolor: "action.hover" },
        // NavLink adds the "active" class to the link that matches the URL
        "&.active": { color: "primary.main", bgcolor: "action.selected" },
        // the little bar on the left edge of the active item
        "&.active::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 12,
          bottom: 12,
          width: 3,
          borderRadius: "0 3px 3px 0",
          bgcolor: "primary.main",
        },
      }}
    >
      <Badge badgeContent={badgeCount} color="error" max={99}>
        <Icon />
      </Badge>
      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

export function Navbar({ counts = {} }) {
    return (
        <Box
            component="nav"
            sx={{
                width: 72,
                height: "100%",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 1.5,
                bgcolor: "background.paper",
                borderRight: 1,
                borderColor: "divider",
            }}
        >
        <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}>
            Tabby
        </Typography>

        {mainItems.map((item) => (
        <NavItem key={item.to} {...item} badgeCount={counts[item.badge] ?? 0} />
        ))}

        {/* pushes Settings to the bottom */}
        <Box sx={{ flexGrow: 1 }} />

        <NavItem {...settingsItem} />
        </Box>
    );
}