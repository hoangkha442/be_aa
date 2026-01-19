import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";

import ProtectedRoute from "@/routes/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ClassesPage from "@/pages/classes/ClassesPage";
import WarningsPage from "@/pages/warnings/WarningsPage";
import NotesPage from "@/pages/notes/NotePage";
import ReportsPage from "@/pages/reports/ReportsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import StudentDetailPage from "@/pages/students/StudentDetailPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/classes", element: <ClassesPage /> },
          { path: "/warnings", element: <WarningsPage /> },
          { path: "/notes", element: <NotesPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/students/:id", element: <StudentDetailPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
