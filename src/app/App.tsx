import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router";
import { TierProvider } from "./context/tier-context";
import { AuthProvider, useAuth } from "./context/auth-context";
import { ProductsProvider } from "./context/products-context";
import { TransactionsProvider } from "./context/transactions-context";
import { Sidebar, SidebarContent } from "./components/layout/sidebar";
import { Topbar } from "./components/layout/topbar";
import { ComingSoon } from "./components/shared/coming-soon";
import { Toaster } from "./components/ui/sonner";
import { MobileDrawer } from "./components/shared/mobile-drawer";
import { AdminGate } from "./components/layout/admin-gate";
import { Dashboard } from "./pages/dashboard";
import { POS } from "./pages/pos";
import { Pricing } from "./pages/pricing";
import { Produk } from "./pages/produk";
import { Stok } from "./pages/stok";
import { ProfilToko } from "./pages/profil-toko";
import { Laporan } from "./pages/laporan";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Onboarding } from "./pages/onboarding";
import { Payment } from "./pages/payment";

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProductsProvider>
      <TransactionsProvider>
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
      </TransactionsProvider>
    </ProductsProvider>
  );
}

/** Admin routes stay closed until server-side authorization is deployed. */
function AppRoutes() {
  const { status, onboarded } = useAuth();

  if (status === "guest") {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/*" element={<AdminGate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (!onboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/admin/*" element={<AdminGate />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/pembayaran" element={<Payment />} />
      <Route path="/admin/*" element={<AdminGate />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="transaksi" element={<POS />} />
        <Route path="paket" element={<Pricing />} />
        <Route path="produk" element={<Produk />} />
        <Route path="stok" element={<Stok />} />
        <Route path="profil-toko" element={<ProfilToko />} />
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