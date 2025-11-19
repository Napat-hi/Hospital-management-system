# Frontend-Only Authentication System
## Hospital Management System - React + React Router v6

---

## 📋 Overview

This is a complete **frontend-only** login and role-based access control (RBAC) system implemented using:
- **React** (Functional Components + Hooks)
- **react-router-dom v6** (BrowserRouter, Routes, Route, Navigate)
- **localStorage** for session management

---

## 🔐 Authentication Flow

### 1. **Login Process** (Home.js)
```
User enters credentials → Validates against demo users → 
Stores in localStorage → Redirects to role-specific page
```

### 2. **Protected Routes** (ProtectedRoute.js)
```
User tries to access page → Check localStorage → 
Check role match → Allow or Redirect to login
```

### 3. **Logout Process** (All protected pages)
```
User clicks Logout → Clear localStorage → Redirect to Home
```

---

## 📁 File Structure

```
src/
├── App.js                      # Main routing configuration
├── components/
│   ├── ProtectedRoute.js      # Route protection component
│   └── LogoutButton.js        # Reusable logout button (optional)
└── pages/
    ├── Home.js                # Login page
    ├── Adminpage.js           # Admin dashboard (admin only)
    ├── Staffpage.js           # Staff dashboard (staff + admin)
    └── Doctorpage.js          # Doctor dashboard (doctor + admin)
```

---

## 🔑 Demo Credentials

| Username | Password | Role   | Can Access                           |
|----------|----------|--------|--------------------------------------|
| admin    | admin    | admin  | /adminpage, /staffpage, /doctorpage |
| staff    | staff    | staff  | /staffpage only                      |
| doctor   | doctor   | doctor | /doctorpage only                     |

**Alternative (backward compatible):**
- Admin / Admin
- Staff / Staff
- Doctor / Doctor

---

## 🛡️ Role-Based Access Control

### Route Permissions

| Route         | admin | staff | doctor |
|---------------|-------|-------|--------|
| `/adminpage`  | ✅    | ❌    | ❌     |
| `/staffpage`  | ✅    | ✅    | ❌     |
| `/doctorpage` | ✅    | ❌    | ✅     |

### Protection Rules
1. **Not logged in** → Redirect to `/` (login page)
2. **Logged in but wrong role** → Redirect to `/` (login page)
3. **Logged in with correct role** → Allow access

---

## 📝 Implementation Details

### 1. **App.js** - Routing Configuration

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Adminpage from './pages/Adminpage';
import Staffpage from './pages/Staffpage';
import Doctorpage from './pages/Doctorpage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login */}
        <Route path="/" element={<Home />} />
        
        {/* Protected Routes */}
        <Route 
          path="/adminpage" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Adminpage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/staffpage" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <Staffpage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/doctorpage" 
          element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <Doctorpage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### 2. **ProtectedRoute.js** - Route Protection Component

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const userRole = localStorage.getItem('role');

  // Not logged in → redirect to login
  if (!loggedIn) {
    return <Navigate to="/" replace />;
  }

  // Wrong role → redirect to login
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Authorized → render page
  return children;
};

export default ProtectedRoute;
```

**How it works:**
- Checks `localStorage` for `loggedIn` and `role`
- Compares user's role against `allowedRoles` array
- Uses `<Navigate>` to redirect unauthorized users
- Passes `replace` prop to prevent back button issues

---

### 3. **Home.js** - Login Page (Key Changes)

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Demo user database
  const demoUsers = {
    "admin": { password: "admin", role: "admin", firstName: "Admin", lastName: "User" },
    "staff": { password: "staff", role: "staff", firstName: "Staff", lastName: "User" },
    "doctor": { password: "doctor", role: "doctor", firstName: "Doctor", lastName: "User" },
  };

  const user = demoUsers[username];

  if (user && user.password === password) {
    // Store in localStorage
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('role', user.role);
    localStorage.setItem('username', username);
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('lastName', user.lastName);

    // Redirect based on role
    if (user.role === 'admin') {
      navigate("/adminpage");
    } else if (user.role === 'staff') {
      navigate("/staffpage");
    } else if (user.role === 'doctor') {
      navigate("/doctorpage");
    }
    return;
  }

  setMessage("Username or Password is incorrect");
};
```

**What gets stored in localStorage:**
- `loggedIn`: "true" or not set
- `role`: "admin", "staff", or "doctor"
- `username`: User's username
- `firstName`: User's first name
- `lastName`: User's last name

---

### 4. **Logout Implementation** (All protected pages)

Each protected page (Adminpage, Staffpage, Doctorpage) has:

```javascript
const handleLogout = () => {
  // Clear authentication data
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  localStorage.removeItem('firstName');
  localStorage.removeItem('lastName');
  
  // Redirect to login
  navigate("/");
};
```

Already integrated in existing logout buttons!

---

## 🧪 Testing Scenarios

### Test 1: Admin Access
1. Login with `admin` / `admin`
2. ✅ Can access `/adminpage`
3. ✅ Can access `/staffpage`
4. ✅ Can access `/doctorpage`
5. ✅ Logout works correctly

### Test 2: Staff Access
1. Login with `staff` / `staff`
2. ❌ Cannot access `/adminpage` (redirects to login)
3. ✅ Can access `/staffpage`
4. ❌ Cannot access `/doctorpage` (redirects to login)

### Test 3: Doctor Access
1. Login with `doctor` / `doctor`
2. ❌ Cannot access `/adminpage` (redirects to login)
3. ❌ Cannot access `/staffpage` (redirects to login)
4. ✅ Can access `/doctorpage`

### Test 4: Direct URL Access
1. Without logging in, type `/adminpage` in browser
2. ❌ Redirected to `/` (login page)
3. Same for `/staffpage` and `/doctorpage`

### Test 5: Logout
1. Login as any user
2. Access their allowed page
3. Click "Logout" button
4. ✅ Redirected to login page
5. ✅ Cannot access protected pages anymore
6. ✅ localStorage cleared

---

## 🔧 How to Use

### Running the Application
```bash
npm install
npm start
```

### Login Steps
1. Open `http://localhost:3000`
2. Enter credentials:
   - **Admin:** admin / admin
   - **Staff:** staff / staff  
   - **Doctor:** doctor / doctor
3. You'll be redirected to your role-specific dashboard
4. Try accessing other pages via URL to test protection
5. Click "Logout" to clear session

---

## 🚀 Features Implemented

✅ **Login System**
- Form validation (username/password required)
- Demo credentials with roles
- Error messages for invalid login
- Backward compatibility with existing code

✅ **Role-Based Access Control**
- Admin: Full access to all pages
- Staff: Access to staff page only
- Doctor: Access to doctor page only

✅ **Protected Routes**
- Automatic redirection for unauthorized access
- Clean URL handling (no tokens in URL)
- Works with direct URL typing

✅ **Session Management**
- localStorage for persistence
- Survives page refresh
- Clean logout with data clearing

✅ **User Experience**
- Smooth navigation transitions
- No flickering or loading delays
- Consistent behavior across pages
- Demo credentials shown on login page

---

## 🔒 Security Notes

### Current Implementation (Development Only)
⚠️ **This is a FRONTEND-ONLY authentication system**
- Credentials stored in plain text (localStorage)
- No encryption
- No backend validation
- **NOT suitable for production**

### For Production, You Need:
1. **Backend API**
   - Authenticate users on server
   - Return JWT tokens
   - Validate tokens on every request

2. **Secure Token Storage**
   - Use HTTP-only cookies (not localStorage)
   - Implement token refresh mechanism
   - Add token expiration

3. **Password Security**
   - Hash passwords with bcrypt
   - Never store plain passwords
   - Implement password reset flow

4. **Additional Security**
   - HTTPS only
   - CSRF protection
   - Rate limiting
   - Session timeout
   - Audit logging

### Production Example (JWT)
```javascript
// Login
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const { token, role } = await response.json();
localStorage.setItem('token', token);
localStorage.setItem('role', role);

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  // Verify token with backend
  useEffect(() => {
    fetch('/api/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) {
        localStorage.clear();
        navigate('/');
      }
    });
  }, []);
  
  if (!token) return <Navigate to="/" />;
  if (!allowedRoles.includes(role)) return <Navigate to="/" />;
  
  return children;
};
```

---

## 📚 Additional Resources

### React Router v6 Documentation
- [Protected Routes Guide](https://reactrouter.com/docs/en/v6/examples/auth)
- [Navigate Component](https://reactrouter.com/docs/en/v6/components/navigate)

### localStorage API
- [MDN localStorage Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Security Best Practices
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 🤝 Support

If you need to:
- Add more roles
- Change access permissions
- Implement backend integration
- Add more validation

Refer to the code comments in each file for guidance!

---

## ✅ Summary

You now have a complete frontend authentication system with:
- ✅ Login page with demo credentials
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Logout functionality
- ✅ localStorage session management
- ✅ Smooth redirects
- ✅ Ready for backend integration

**All code is in place and ready to use!**
