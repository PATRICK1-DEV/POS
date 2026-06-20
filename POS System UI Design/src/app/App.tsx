import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "../lib/auth-context";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import POSPage from "./POSPage";
import AdminProductsPage from "../pages/AdminProductsPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ShopProductsPageWrapper from "../pages/ShopProductsPageWrapper";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <POSPage />;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="size-full flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 flex items-center justify-center p-2">
          <img src="/logo2.jpeg" alt="" className="w-full h-full object-contain drop-shadow-sm" />
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <HomeRedirect /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <HomeRedirect /> : <RegisterPage />}
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/shop/products"
        element={
          user ? <ShopProductsPageWrapper /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/*"
        element={<HomeRedirect />}
      />
    </Routes>
  );
}
