import { Toaster as LegacyToaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/authStore";
import AdminLayout from "@/components/layouts/AdminLayout";
import Login from "@/pages/Login";
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Users = lazy(() => import("@/pages/Users"));
const Components = lazy(() => import("@/pages/Components"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Profile = lazy(() => import("@/pages/Profile"));
const Permissions = lazy(() => import("@/pages/Permissions"));
const Roles = lazy(() => import("@/pages/Roles"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const ArticleManagement = lazy(() => import("@/pages/ArticleManagement"));
const ArticleCategoryManagement = lazy(
  () => import("@/pages/ArticleCategoryManagement"),
);
const ArticleEditor = lazy(() => import("@/pages/ArticleEditor"));
function RequireAuth() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search + location.hash }}
      replace
    />
  );
}
export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<RequireAuth />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="components" element={<Components />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="permissions" element={<Permissions />} />
                  <Route path="roles" element={<Roles />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="article/list" element={<ArticleManagement />} />
                  <Route
                    path="article/categories"
                    element={<ArticleCategoryManagement />}
                  />
                  <Route
                    path="article/new"
                    element={<ArticleEditor key="new" />}
                  />
                  <Route path="article/edit/:id" element={<ArticleEditor />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster richColors />
        <LegacyToaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
