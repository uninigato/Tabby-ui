import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

//Pages
import { SignUp } from "../Pages/SignUp/SignUp";
import { Login } from "../Pages/Login/Login";
import { Friends } from "../Pages/Friends/FriendsMain";
import { Receipts } from "../Pages/Receipts/ReceiptsMain";
import { Activity } from "../Pages/Activity/Activity";
import { Settings } from "../Pages/Settings/Settings";

// Sends you to /login when there's no logged-in user
function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // still checking the saved token
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/friends" replace />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/friends" element={ <RequireAuth> <Friends /> </RequireAuth> }/>
      <Route path="/receipts" element={ <RequireAuth> <Receipts /> </RequireAuth> }/>
      <Route path="/activity" element={ <RequireAuth> <Activity /> </RequireAuth> }/>
      <Route path="/settings" element={ <RequireAuth> <Settings /> </RequireAuth> }/>
    </Routes>
  );
}