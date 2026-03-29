import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { TasksPage } from "./pages/Tasks";
import { TaskDetailPage } from "./pages/TaskDetail";
import { TaskNewPage } from "./pages/TaskNew";
import { TeamTasksPage } from "./pages/TeamTasks";
import { TeamLeadTasksPage } from "./pages/TeamLeadTasks";
import { CalendarPage } from "./pages/Calendar";
import { AdminPage } from "./pages/Admin";
import { UsersPage } from "./pages/Users";
import { TeamsPage } from "./pages/Teams";
import { ArchivedTasksPage } from "./pages/ArchivedTasks";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/new" element={<TaskNewPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="team-tasks" element={<TeamTasksPage />} />
        <Route path="team-lead-tasks" element={<TeamLeadTasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="archived-tasks" element={<ArchivedTasksPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="teams" element={<AdminRoute><TeamsPage /></AdminRoute>} />
      </Route>
    </Routes>
  );
}
