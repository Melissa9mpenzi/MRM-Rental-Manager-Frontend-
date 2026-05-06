import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import ProtectedRoute      from "./components/layout/ProtectedRoute";
import AppLayout           from "./components/layout/AppLayout";
import AuthLayout          from "./components/layout/AuthLayout";

import LoginPage           from "./pages/auth/LoginPage";
import RegisterPage        from "./pages/auth/RegisterPage";
import ForgotPasswordPage  from "./pages/auth/ForgotPasswordPage";
import DashboardPage       from "./pages/dashboard/DashboardPage";
import TenantDashboard     from "./pages/tenant/TenantDashboard";
import TenantAcceptInvite  from "./pages/tenant/TenantAcceptInvite";
import PropertiesPage      from "./pages/properties/PropertiesPage";
import PropertyDetailPage  from "./pages/properties/PropertyDetailPage";
import TenantsPage         from "./pages/tenants/TenantsPage";
import TenantDetailPage    from "./pages/tenants/TenantDetailPage";
import AddTenantPage       from "./pages/tenants/AddTenantPage";
import PaymentsPage        from "./pages/payments/PaymentsPage";
import RecordPaymentPage   from "./pages/payments/RecordPaymentPage";
import MaintenancePage     from "./pages/maintenance/MaintenancePage";
import ArrearsReportPage   from "./pages/reports/ArrearsReportPage";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function PlaceholderPage({ title }) {
  return (
    <div className="card text-center py-16 text-brand-mid space-y-2">
      <div className="text-4xl">🚧</div>
      <div className="font-bold text-brand-dark">{title}</div>
      <div className="text-sm">Coming soon</div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            className: "text-sm font-semibold",
            success: { iconTheme: { primary: "#5e8d83", secondary: "#fff" } },
          }}
        />
        <Routes>
          {/* ── Auth ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* ── Tenant Portal (public invite) ── */}
          <Route path="/tenant/accept-invite" element={<TenantAcceptInvite />} />

          {/* ── App (protected) ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"          element={<DashboardPage />} />
              <Route path="/properties"         element={<PropertiesPage />} />
              <Route path="/properties/:id"     element={<PropertyDetailPage />} />
              <Route path="/tenants"            element={<TenantsPage />} />
              <Route path="/tenants/new"        element={<AddTenantPage />} />
              <Route path="/tenants/:id"        element={<TenantDetailPage />} />
              <Route path="/payments"           element={<PaymentsPage />} />
              <Route path="/payments/new"       element={<RecordPaymentPage />} />
              <Route path="/maintenance"        element={<MaintenancePage />} />
              <Route path="/reports/arrears"    element={<ArrearsReportPage />} />
              <Route path="/tenant/dashboard"   element={<TenantDashboard />} />
              <Route path="/settings"           element={<PlaceholderPage title="Settings" />} />
              <Route path="*"                   element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}