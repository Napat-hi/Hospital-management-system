import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Adminpage from './pages/Adminpage';
import Doctorpage from './pages/Doctorpage';
import Staffpage from './pages/Staffpage';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Login Page */}
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected Routes with Role-Based Access */}
          
          {/* Admin Page - Only admin role can access */}
          <Route 
            path="/adminpage" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Adminpage />
              </ProtectedRoute>
            } 
          />

          {/* Staff Page - Both staff and admin roles can access */}
          <Route 
            path="/staffpage" 
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <Staffpage />
              </ProtectedRoute>
            } 
          />

          {/* Doctor Page - Both doctor and admin roles can access */}
          <Route 
            path="/doctorpage" 
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <Doctorpage />
              </ProtectedRoute>
            } 
          />

          {/* Legacy routes for backward compatibility */}
          <Route 
            path="/Adminpage" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Adminpage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/Staffpage" 
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <Staffpage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/Doctorpage" 
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <Doctorpage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
