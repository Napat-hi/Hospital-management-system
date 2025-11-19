# Hospital Management System - Authentication & Protected Routes

## 🔐 Overview

This is a complete login and protected route system built with React and react-router-dom v6. The system includes role-based access control (RBAC) with three user roles: Admin, Staff, and Doctor.

## 📁 File Structure

```
src/
├── App.js                          # Main app with routing configuration
├── components/
│   └── RequireAuth.jsx            # Protected route component
└── pages/
    ├── LoginPage.jsx              # Login page with authentication
    ├── LoginPage.css              # Login page styles
    ├── AdminPage.jsx              # Admin dashboard (admin only)
    ├── StaffPage.jsx              # Staff dashboard (staff + admin)
    ├── DoctorPage.jsx             # Doctor dashboard (doctor only)
    └── DashboardPage.css          # Shared dashboard styles
```

## 🚀 Features

### 1. **Authentication System**
- User login with username and password validation
- Credentials stored in localStorage (username + role)
- Automatic redirection based on user role
- Logout functionality on all dashboard pages

### 2. **Role-Based Access Control (RBAC)**
- **Admin**: Full access to admin dashboard only
- **Staff**: Access to staff dashboard (admin can also access)
- **Doctor**: Access to doctor dashboard only

### 3. **Protected Routes**
- Unauthenticated users redirected to login (`/`)
- Unauthorized users (wrong role) redirected to login (`/`)
- Routes protected with `RequireAuth` component

### 4. **Modern UI Design**
- Gradient backgrounds
- Responsive card layouts
- Hover effects and animations
- Mobile-friendly design

## 🔑 Demo Credentials

| Username | Password    | Role   | Access                    |
|----------|-------------|--------|---------------------------|
| admin    | admin123    | admin  | /admin, /staff            |
| staff    | staff123    | staff  | /staff                    |
| doctor   | doctor123   | doctor | /doctor                   |

## 📋 Route Configuration

| Route    | Access              | Description              |
|----------|---------------------|--------------------------|
| `/`      | Public              | Login page               |
| `/admin` | admin only          | Admin dashboard          |
| `/staff` | staff + admin       | Staff dashboard          |
| `/doctor`| doctor only         | Doctor dashboard         |

## 🛠️ How It Works

### 1. **Login Flow** (LoginPage.jsx)
```javascript
// User submits credentials
// System validates against mock user database
// On success:
//   - Store username in localStorage
//   - Store role in localStorage
//   - Redirect to appropriate dashboard
// On failure:
//   - Display error message
```

### 2. **Route Protection** (RequireAuth.jsx)
```javascript
// Check if user is authenticated (localStorage)
// Check if user role matches allowedRoles
// If not authenticated → redirect to "/"
// If wrong role → redirect to "/"
// If authorized → render children components
```

### 3. **Dashboard Pages**
- Display welcome message with username
- Show role badge
- Feature cards for role-specific functionality
- Logout button that clears localStorage and redirects

## 🔧 Integration with Backend

To connect with your actual backend API, modify `LoginPage.jsx`:

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    // Replace with your API endpoint
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      localStorage.setItem('token', data.token); // Optional: JWT token

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'staff') {
        navigate('/staff');
      } else if (data.role === 'doctor') {
        navigate('/doctor');
      }
    } else {
      setError(data.message || 'Invalid credentials');
    }
  } catch (error) {
    setError('Network error. Please try again.');
  }
};
```

## 🔒 Security Considerations

### Current Implementation (Development)
- Credentials stored in localStorage
- Mock authentication (no real backend)
- **Not production-ready**

### Production Recommendations
1. **Use JWT Tokens**: Store JWT tokens instead of plain credentials
2. **HTTP-Only Cookies**: More secure than localStorage
3. **Token Expiration**: Implement token refresh mechanism
4. **HTTPS**: Always use HTTPS in production
5. **Backend Validation**: Never trust client-side role checks alone
6. **Password Hashing**: Hash passwords on the backend (bcrypt)
7. **Rate Limiting**: Prevent brute force attacks
8. **CSRF Protection**: Implement CSRF tokens

### Enhanced Security Example
```javascript
// RequireAuth.jsx - Production version
const RequireAuth = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Verify token with backend
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          // Token invalid, logout
          localStorage.clear();
          navigate('/');
        }
      } catch (error) {
        localStorage.clear();
        navigate('/');
      }
    };
    
    if (token) verifyToken();
  }, [token]);

  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop**: Multi-column card layout
- **Tablet**: Adjusted grid
- **Mobile**: Single column layout, stacked elements

## 🎨 Customization

### Change Colors
Edit `DashboardPage.css` and `LoginPage.css`:
```css
/* Admin Badge Color */
.admin-badge {
  background: linear-gradient(135deg, #yourColor1 0%, #yourColor2 100%);
}

/* Login Background */
.login-container {
  background: linear-gradient(135deg, #yourColor1 0%, #yourColor2 100%);
}
```

### Add New Role
1. Add credentials to `LoginPage.jsx`
2. Create new dashboard page
3. Add route in `App.js` with `RequireAuth`
4. Update `allowedRoles` arrays as needed

## 🧪 Testing

Test each scenario:
1. ✅ Login with admin → access /admin and /staff
2. ✅ Login with staff → access /staff only
3. ✅ Login with doctor → access /doctor only
4. ✅ Try accessing /admin without login → redirect to /
5. ✅ Try accessing /admin as staff → redirect to /
6. ✅ Logout → clear localStorage → redirect to /

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.24.0"
}
```

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm start

# Application runs at http://localhost:3000
```

## 📝 Notes

- This system uses localStorage for demo purposes
- For production, implement proper JWT authentication
- Backend API validation is essential for real security
- Current password validation is client-side only (not secure)
- Consider implementing session timeout
- Add "Remember Me" functionality if needed
- Implement password reset flow for production

## 🤝 Contributing

Feel free to enhance the authentication system with:
- Two-factor authentication (2FA)
- Password strength meter
- Account lockout after failed attempts
- Session management
- User profile management
- Audit logging

## 📄 License

This code is provided as-is for educational and development purposes.
