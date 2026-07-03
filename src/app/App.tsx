import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router";
import { TierProvider } from "./context/tier-context";
import { AuthProvider, useAuth } from "./context/auth-context";
import { Sidebar, SidebarContent } from "./components/layout/sidebar";
import { Topbar } from "./components/layout/topbar";
import { ComingSoon } from "./components/shared/coming-soon";
import { Toaster } from "./components/ui/sonner";
import { MobileDrawer } from "./components/shared/mobile-drawer";
import { Dashboard } from "./pages/dashboard";
import { POS } from "./pages/pos";
import { Pricing } from "./pages/pricing";
import { Produk } from "./pages/produk";
import { Laporan } from "./pages/laporan";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Onboarding } from "./pages/onboarding";
import { Payment } from "./pages/payment";
import { AdminDashboard } from "./pages/admin/dashboard";
import { AdminUsers } from "./pages/admin/users";
import { AdminSubscriptions } from "./pages/admin/subscriptions";

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop rail */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Mobile off-canvas drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        title="Menu navigasi"
      >
        <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </MobileDrawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/**
 * Route tree branches on auth state (see plans/ Fase 4):
 *  - guest              -> Landing / Login / Register (+ admin, always reachable)
 *  - authed, !onboarded -> forced into Onboarding (+ admin)
 *  - authed, onboarded  -> the existing AppLayout tree (+ /pembayaran, + admin)
 *
 * Admin (06a/b/c) is a separate internal tool, not gated behind the
 * consumer auth flow — same as the original static prototype, where
 * "Keluar" on the admin pages just links back to the marketing site.
 */
function AppRoutes() {
  const { status, onboarded } = useAuth();

  if (status === "guest") {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (!onboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/pembayaran" element={<Payment />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="transaksi" element={<POS />} />
        <Route path="paket" element={<Pricing />} />
        <Route path="produk" element={<Produk />} />
        <Route path="stok" element={<ComingSoon title="Stok" />} />
        <Route path="laporan" element={<Laporan />} />
        <Route path="pengaturan" element={<ComingSoon title="Pengaturan" />} />
        <Route path="*" element={<ComingSoon title="Halaman tidak ditemukan" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <TierProvider>
      <AuthProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TierProvider>
  );
}
