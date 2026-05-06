import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, CreditCard, FileText, Wrench, User, LogOut, Bell } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";

function TenantDashboard() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [lease, setLease] = useState(null);

  useEffect(() => {
    fetchTenantData();
  }, []);

  async function fetchTenantData() {
    try {
      setLoading(true);
      // Fetch tenant profile
      const meRes = await fetch("http://localhost:8000/api/v1/tenant/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        setTenantData(meData);
      }

      // Fetch payments
      const payRes = await fetch("http://localhost:8000/api/v1/tenant/my-payments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData);
      }

      // Fetch lease
      const leaseRes = await fetch("http://localhost:8000/api/v1/tenant/my-lease", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (leaseRes.ok) {
        const leaseData = await leaseRes.json();
        setLease(leaseData);
      }
    } catch (err) {
      toast.error("Failed to load tenant data.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-brand-teal" />
              </div>
              <h1 className="text-xl font-bold text-brand-dark">Tenant Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {tenantData?.full_name || "Tenant"}
          </h2>
          <p className="text-gray-600 mt-1">
            {lease?.property?.name} - Unit {lease?.unit?.unit_number}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Monthly Rent</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              UGX {lease?.tenant?.monthly_rent?.toLocaleString() || "0"}
            </p>
            <p className="text-sm text-gray-500 mt-1">Due on the 1st of each month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Lease Status</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {lease?.tenant?.status || "Active"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Until {lease?.tenant?.lease_end || "N/A"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Deposit</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              UGX {lease?.tenant?.deposit_amount?.toLocaleString() || "0"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {lease?.tenant?.deposit_paid ? "Paid" : "Pending"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "overview"
                    ? "border-brand-teal text-brand-teal"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "payments"
                    ? "border-brand-teal text-brand-teal"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setActiveTab("maintenance")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "maintenance"
                    ? "border-brand-teal text-brand-teal"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Maintenance
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Property</p>
                      <p className="font-medium text-gray-900">{lease?.property?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unit Number</p>
                      <p className="font-medium text-gray-900">{lease?.unit?.unit_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{lease?.property?.address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unit Type</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {lease?.unit?.unit_type?.replace("_", " ") || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Lease Start</p>
                      <p className="font-medium text-gray-900">{lease?.tenant?.lease_start || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lease End</p>
                      <p className="font-medium text-gray-900">{lease?.tenant?.lease_end || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                {payments.length === 0 ? (
                  <p className="text-gray-500">No payment records found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Period</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-3 text-gray-900">{payment.payment_date}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              UGX {parseFloat(payment.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {payment.period_month}/{payment.period_year}
                            </td>
                            <td className="px-4 py-3 text-gray-600 capitalize">
                              {payment.payment_method?.replace("_", " ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "maintenance" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Requests</h3>
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Submit maintenance requests to your landlord</p>
                    <button className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90">
                      New Request (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;
