import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import LocationButton from "../../components/LocationButton/LocationButton";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    setLoading(true);
    axiosInstance.get("/users/profile")
      .then((response) => {
        setProfile(response.data);
        setLoading(false);
      })
      .catch((error) => {
        toast.error(error.response?.data || "Failed to load profile");
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axiosInstance.put("/users/profile", profile)
      .then((response) => {
        setProfile(response.data);
        setEditing(false);
        toast.success("Profile updated successfully!");
        setLoading(false);
      })
      .catch((error) => {
        toast.error(error.response?.data || "Failed to update profile");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">👤 My Profile</h1>
              <p className="text-gray-500 text-sm mt-1">View and update your profile information</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {loading && !editing ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none ${editing ? "focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={profile.phoneNumber || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none ${editing ? "focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={profile.address || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  rows="2"
                  className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none ${editing ? "focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                    }`}
                />
                {editing && <LocationButton label="Use current organization/home location" onAddress={(address) => setProfile((current) => ({ ...current, address }))} />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={profile.role || ""}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Role cannot be changed</p>
              </div>

              {editing && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;