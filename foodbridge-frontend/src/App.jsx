import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Contact from './pages/Contact/Contact'
import About from './pages/About/About'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import DonorDashboard from './pages/Donor/Dashboard'
import NgoDashboard from './pages/Ngo/Dashboard'
import VolunteerDashboard from './pages/Volunteer/Dashboard'
import AdminDashboard from './pages/Admin/Dashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import Profile from './pages/Profile/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <BrowserRouter>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/about' element={<About />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/donor/dashboard' element={
          <ProtectedRoute allowedRole="DONOR">
            <DonorDashboard />
          </ProtectedRoute>
        } />

        <Route path='/ngo/dashboard' element={
          <ProtectedRoute allowedRole="NGO">
            <NgoDashboard />
          </ProtectedRoute>
        } />
        <Route path='/admin/dashboard' element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path='/volunteer/dashboard' element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <VolunteerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  )
}

export default App