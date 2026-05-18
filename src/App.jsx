import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import MarketingLayout from "./components/layout/MarketingLayout";
import MarketplaceShell from "./components/layout/MarketplaceShell";
import RoleGuard from "./components/layout/RoleGuard";
import { API_ROLES } from "./config/access";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import SelectRolePage from "./pages/auth/SelectRolePage";
import KycPage from "./pages/auth/KycPage";
import AdminTwoFaPage from "./pages/auth/AdminTwoFaPage";
import PendingApprovalPage from "./pages/auth/PendingApprovalPage";
import RoleHomeRedirect from "./pages/auth/RoleHomeRedirect";

import LandingPage from "./pages/marketing/LandingPage";
import StaticInfoPage from "./pages/marketing/StaticInfoPage";
import PropertySearchPage from "./pages/marketplace/PropertySearchPage";
import ListingDetailPage from "./pages/marketplace/ListingDetailPage";
import ListingIdRedirect from "./pages/marketplace/ListingIdRedirect";

import LandlordDashboard from "./pages/dashboard/LandlordDashboard";
import TenantDashboardRd from "./pages/dashboard/TenantDashboardRd";
import AgentDashboardRd from "./pages/dashboard/AgentDashboardRd";
import AdminDashboardRd from "./pages/dashboard/AdminDashboardRd";
import AdminUsersListPage from "./pages/admin/AdminUsersListPage";

import TenantAcceptInvite from "./pages/tenant/TenantAcceptInvite";
import TenantProfilePage from "./pages/tenant/TenantProfilePage";
import TenantWalletPage from "./pages/tenant/TenantWalletPage";
import TenantApplicationsPage from "./pages/tenant/TenantApplicationsPage";
import TenantSavedPage from "./pages/tenant/TenantSavedPage";
import PropertiesPage from "./pages/properties/PropertiesPage";
import PropertyDetailPage from "./pages/properties/PropertyDetailPage";
import TenantsPage from "./pages/tenants/TenantsPage";
import TenantDetailPage from "./pages/tenants/TenantDetailPage";
import AddTenantPage from "./pages/tenants/AddTenantPage";
import PaymentsPage from "./pages/payments/PaymentsPage";
import RecordPaymentPage from "./pages/payments/RecordPaymentPage";
import PaymentFlowPage from "./pages/payments/PaymentFlowPage";
import MaintenancePage from "./pages/maintenance/MaintenancePage";
import ArrearsReportPage from "./pages/reports/ArrearsReportPage";
import ContractPage from "./pages/legal/ContractPage";
import MessagesPage from "./pages/messages/MessagesPage";
import SettingsPage from "./pages/settings/SettingsPage";
import LandlordAddPropertyPage from "./pages/landlord/LandlordAddPropertyPage";
import SharedInAppNotificationsPage from "./pages/notifications/SharedInAppNotificationsPage";
import {
  LandlordApplicantsPage,
  LandlordContractsPage,
  LandlordAnalyticsPage,
  LandlordReportsHubPage,
  LandlordWalletPage,
  AgentLeadsPage,
  AgentClientsPage,
  AgentSchedulesPage,
  AgentDealsPage,
  AgentCommissionsPage,
  AgentAnalyticsPage,
  AdminListingsPage,
  AdminModerationPage,
  AdminPaymentsPage,
  AdminContractsPage,
  AdminFraudPage,
  AdminAnalyticsPage,
  AdminReportsPage,
  AdminSupportPage,
  AdminAuditLogsPage,
  AdminSystemSettingsPage,
} from "./pages/workspace/placeholders.jsx";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            className: "text-sm font-semibold",
            success: { iconTheme: { primary: "#00C076", secondary: "#041208" } },
          }}
        />
        <Routes>
          {/* ── Public marketing ── */}
          <Route path="/" element={<LandingPage />} />

          {/* Legacy public URLs → canonical */}
          <Route path="/browse" element={<Navigate to="/browse-properties" replace />} />
          <Route path="/listings/:id" element={<ListingIdRedirect />} />

          <Route element={<MarketingLayout />}>
            <Route path="/about" element={<StaticInfoPage page="about" />} />
            <Route path="/contact" element={<StaticInfoPage page="contact" />} />
            <Route path="/pricing" element={<StaticInfoPage page="pricing" />} />
            <Route path="/tenant/accept-invite" element={<TenantAcceptInvite />} />
          </Route>

          {/* Browse + listing: marketing shell when logged out, app shell (sidebar) when logged in */}
          <Route element={<MarketplaceShell />}>
            <Route path="/browse-properties" element={<PropertySearchPage />} />
            <Route path="/property/:id" element={<ListingDetailPage />} />
          </Route>

          {/* ── Auth ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/auth/select-role" element={<SelectRolePage />} />
            <Route path="/auth/kyc" element={<KycPage />} />
          </Route>

          {/* ── Authenticated app (JWT) + role-prefixed modules ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/auth/admin-2fa" element={<AdminTwoFaPage />} />
            </Route>
            <Route element={<AppLayout />}>
              <Route path="/verification-pending" element={<PendingApprovalPage />} />
              <Route path="/dashboard" element={<RoleHomeRedirect />} />

              {/* Tenant */}
              <Route element={<RoleGuard allowed={[API_ROLES.tenant]} />}>
                <Route path="/tenant" element={<Navigate to="/tenant/dashboard" replace />} />
                <Route path="/tenant/dashboard" element={<TenantDashboardRd />} />
                <Route path="/tenant/saved" element={<TenantSavedPage />} />
                <Route path="/tenant/applications" element={<TenantApplicationsPage />} />
                <Route path="/tenant/wallet" element={<TenantWalletPage />} />
                <Route path="/tenant/notifications" element={<SharedInAppNotificationsPage />} />
                <Route path="/tenant/profile" element={<TenantProfilePage />} />
                <Route path="/tenant/pay" element={<PaymentFlowPage />} />
                <Route path="/tenant/contract" element={<ContractPage />} />
                <Route path="/tenant/messages" element={<MessagesPage />} />
                <Route path="/tenant/settings" element={<SettingsPage />} />
              </Route>

              {/* Landlord */}
              <Route element={<RoleGuard allowed={[API_ROLES.landlord]} />}>
                <Route path="/landlord" element={<Navigate to="/landlord/dashboard" replace />} />
                <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
                <Route path="/landlord/properties/new" element={<LandlordAddPropertyPage />} />
                <Route path="/landlord/properties" element={<PropertiesPage />} />
                <Route path="/landlord/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/landlord/applicants" element={<LandlordApplicantsPage />} />
                <Route path="/landlord/contracts" element={<LandlordContractsPage />} />
                <Route path="/landlord/analytics" element={<LandlordAnalyticsPage />} />
                <Route path="/landlord/reports" element={<LandlordReportsHubPage />} />
                <Route path="/landlord/notifications" element={<SharedInAppNotificationsPage />} />
                <Route path="/landlord/wallet" element={<LandlordWalletPage />} />
                <Route path="/landlord/tenants" element={<TenantsPage />} />
                <Route path="/landlord/tenants/new" element={<AddTenantPage />} />
                <Route path="/landlord/tenants/:id" element={<TenantDetailPage />} />
                <Route path="/landlord/payments" element={<PaymentsPage />} />
                <Route path="/landlord/payments/new" element={<RecordPaymentPage />} />
                <Route path="/landlord/maintenance" element={<MaintenancePage />} />
                <Route path="/landlord/reports/arrears" element={<ArrearsReportPage />} />
                <Route path="/landlord/messages" element={<MessagesPage />} />
                <Route path="/landlord/settings" element={<SettingsPage />} />
              </Route>

              {/* Agent (API role: staff) */}
              <Route element={<RoleGuard allowed={["staff", "agent"]} />}>
                <Route path="/agent" element={<Navigate to="/agent/dashboard" replace />} />
                <Route path="/agent/dashboard" element={<AgentDashboardRd />} />
                <Route path="/agent/leads" element={<AgentLeadsPage />} />
                <Route path="/agent/clients" element={<AgentClientsPage />} />
                <Route path="/agent/schedules" element={<AgentSchedulesPage />} />
                <Route path="/agent/deals" element={<AgentDealsPage />} />
                <Route path="/agent/commissions" element={<AgentCommissionsPage />} />
                <Route path="/agent/analytics" element={<AgentAnalyticsPage />} />
                <Route path="/agent/notifications" element={<SharedInAppNotificationsPage />} />
                <Route path="/agent/messages" element={<MessagesPage />} />
                <Route path="/agent/settings" element={<SettingsPage />} />
              </Route>

              {/* Admin */}
              <Route element={<RoleGuard allowed={[API_ROLES.admin]} />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboardRd />} />
                <Route path="/admin/users" element={<AdminUsersListPage />} />
                <Route path="/admin/listings" element={<AdminListingsPage />} />
                <Route path="/admin/moderation" element={<AdminModerationPage />} />
                <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                <Route path="/admin/contracts" element={<AdminContractsPage />} />
                <Route path="/admin/fraud" element={<AdminFraudPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/support" element={<AdminSupportPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/admin/system-settings" element={<AdminSystemSettingsPage />} />
                <Route path="/admin/notifications" element={<SharedInAppNotificationsPage />} />
                <Route path="/admin/messages" element={<MessagesPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
