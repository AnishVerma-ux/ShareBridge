import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { categoryLabels, getDonationTitle } from "../../data/donationCategories";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);

    // Fetch all users
    axiosInstance.get("/users")
      .then((userRes) => {
        setUsers(userRes.data || []);
        return axiosInstance.get("/donations");
      })
      .then((donationRes) => {
        setDonations(donationRes.data || []);
        setLoading(false);
      })
      .catch((error) => {
        toast.error(error.response?.data || "Failed to load admin data");
        setLoading(false);
      });
  };

  // Stats calculations
  const totalUsers = users.length;
  const totalDonations = donations.length;
  const pendingDonations = donations.filter(d => d.status === 'AVAILABLE').length;
  const deliveredDonations = donations.filter(d => d.status === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-[#f7f9f7] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🛡️ Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users and monitor platform activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-3xl font-bold text-gray-800">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Total Donations</p>
            <p className="text-3xl font-bold text-gray-800">{totalDonations}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Pending Donations</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingDonations}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-3xl font-bold text-green-600">{deliveredDonations}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">👤 Users</h2>
                <span className="text-sm text-gray-400">{totalUsers} total</span>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No users registered</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'DONOR' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'NGO' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Donations List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">📦 Donations</h2>
                <span className="text-sm text-gray-400">{totalDonations} total</span>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                {donations.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No donations yet</p>
                ) : (
                  donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{getDonationTitle(donation)}</p>
                        <p className="text-xs text-gray-500">Category: {categoryLabels[donation.category] || (donation.category || "Donation").replaceAll("_", " ")} · Qty: {donation.quantity} | {donation.pickupAddress}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        donation.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        donation.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-800' :
                        donation.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                        donation.status === 'DELIVERED' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {donation.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;