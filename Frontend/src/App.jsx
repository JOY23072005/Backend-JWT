import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    element: (
      <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
        <DashboardLayout/>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },

      {
        path: "/organizations",
        element: <div>Organizations</div>,
      },

      {
        path: "/users",
        element: <div>Users</div>,
      },

      {
        path: "/rewards",
        element: <div>Rewards</div>,
      },

      {
        path: "/challenges",
        element: <div>Challenges</div>,
      },

      {
        path: "/redemptions",
        element: <div>Redemptions</div>,
      },
    ],
  },

  {
    element: (
      <ProtectedRoute allowedRoles={["staff"]}>
        <DashboardLayout title="Staff Panel" />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/staff/redemptions",
        element: <div>Staff Redemptions</div>,
      },
    ],
  },

  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}