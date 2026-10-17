import { useState } from "react"
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LocationButton from "../../components/LocationButton/LocationButton";

const Register = () => {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const handleRegister = (e) => {
    e.preventDefault();
    // Build the request object
    const requestData = {
      fullName,
      email,
      password,
      phoneNumber,
      address,
      role,
      organizationName: role === "NGO" ? organizationName : null
    };

    // Make the API call
    axiosInstance.post("/users", requestData)
      .then((response) => {
        console.log("Registration successful:", response.data);
        toast.success("Registration successful! Please login.");
        navigate("/login");
      })
      .catch((error) => {
        toast.error(error.response?.data || "Registration failed. Please check your details.");
      });
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter your name"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter your contact number"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select role</option>
              <option value="DONOR">Donor</option>
              <option value="NGO">NGO</option>
              <option value="VOLUNTEER">Volunteer</option>
            </select>
          </div>

          {role === "NGO" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                value={organizationName}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter your organization name"
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter your address"
              rows={3}
            />
            <LocationButton label={role === "NGO" ? "Use current NGO location" : "Use my current location"} onAddress={setAddress} />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register