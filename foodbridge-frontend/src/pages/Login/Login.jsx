import { useState, useContext } from 'react'
import axiosInstance from "../../api/axiosInstance"
import { AuthContext } from '../../context/AuthContext'
import { jwtDecode } from "jwt-decode"
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const { user, setUser } = useContext(AuthContext)
  const nevigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault()
    axiosInstance.post("/users/login", {
      email: email,
      password: password
    })
      .then((response) => {
        const token = response.data
        const decoded = jwtDecode(token)
        localStorage.setItem("token", token)
        setUser({
          token: token,
          role: decoded.role,
          email: decoded.sub
        })
        toast.success("Login Successful...");
        nevigate(`/${decoded.role.toLowerCase()}/dashboard`, { replace: true });
      })
      .catch((error) => {
        console.log(error.response.data)
        toast.error(error.response.data);
      })
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter your email"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login