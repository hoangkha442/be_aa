import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";

import ProtectedRoute from "@/routes/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ClassesPage from "@/pages/classes/ClassesPage";
import StudentsPage from "@/pages/students/StudentsPage";
import WarningsPage from "@/pages/warnings/WarningsPage";
import NotesPage from "@/pages/notes/NotePage";
import ReportsPage from "@/pages/reports/ReportsPage";
import SettingsPage from "@/pages/settings/SettingsPage";

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
          { path: "/students", element: <StudentsPage /> },
          { path: "/warnings", element: <WarningsPage /> },
          { path: "/notes", element: <NotesPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
