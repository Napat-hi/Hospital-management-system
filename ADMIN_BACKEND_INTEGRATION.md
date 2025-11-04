Title was here

# Backend Integration Guide - Admin Page

## Overviwwwwew
The Admin page (`Adminpage.js`) is fully prepared for backend database integration. All CRUD operations have placeholder functions ready to connect to your API.

## Current State
- ✅ Frontend UI complete with forms and validation
- ✅ State management implemented
- ✅ Placeholder API calls ready
- ⏳ Needs backend API connection
- ⏳ Needs real database

## Quick Start Integration

### 1. Update API Configuration
Edit `src/api/config.js`:
```javascript
export const API_BASE_URL = 'https://your-backend-domain.com';
```

Or set environment variable in `.env`:
```
REACT_APP_API_URL=https://your-backend-domain.com
```

### 2. Replace Dummy Data
In `Adminpage.js`, replace this section:
```javascript
// Current (lines 22-32)
const dummyUsers = [...];
const listData = Array.isArray(state.listdata) && state.listdata.length > 0
  ? state.listdata
  : dummyUsers;
```

With API call:
```javascript
const [listData, setListData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const users = await userAPI.getAll();
      setListData(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);
```

### 3. Update API Endpoints
The following functions are ready for backend:

#### Create User (`handleCreateUser`)
- Location: Line ~118
- Method: POST
- Endpoint: `/api/users`
- Payload: `{ role, fullName, department, specialization/position, phone, email }`

#### Update User (`handleUpdateUser`)
- Location: Line ~201
- Method: PUT
- Endpoint: `/api/users/:id`
- Payload: `{ id, role, fullName, department, specialization/position, phone, email }`

#### Disable User (`handleDisableUser`)
- Location: Line ~218
- Method: PATCH
- Endpoint: `/api/users/:id/disable`
- Payload: `{ status: 'disabled' }`

## Backend Requirements

### Database Schema
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role ENUM('Doctor', 'Staff') NOT NULL,
  department VARCHAR(100),
  specialization VARCHAR(100),  -- For Doctors
  position VARCHAR(100),        -- For Staff
  status ENUM('active', 'disabled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints to Implement

#### GET /api/users
Returns all users (or filtered/paginated)
```json
Response: [
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@hospital.com",
    "phone": "123-456-7890",
    "role": "Doctor",
    "department": "Cardiology",
    "specialization": "Cardiology",
    "status": "active"
  }
]
```

#### POST /api/users
Create new user
```json
Request: {
  "role": "Doctor",
  "fullName": "John Doe",
  "department": "Cardiology",
  "specialization": "Cardiology",
  "phone": "123-456-7890",
  "email": "john.doe@hospital.com"
}

Response: {
  "message": "User created successfully",
  "user": { ...user object }
}
```

#### PUT /api/users/:id
Update existing user
```json
Request: {
  "fullName": "John Doe Updated",
  "department": "Emergency Medicine",
  ...
}

Response: {
  "message": "User updated successfully",
  "user": { ...updated user object }
}
```

#### PATCH /api/users/:id/disable
Disable user (soft delete - does not remove from database)
```json
Request: {
  "status": "disabled"
}

Response: {
  "message": "User disabled successfully",
  "user": {
    "id": 1,
    "status": "disabled",
    ...
  }
}
```

## Authentication (Optional)
If your backend requires authentication:

1. Add token storage after login:
```javascript
localStorage.setItem('authToken', token);
```

2. The `config.js` helper automatically includes the token in headers

## Error Handling
All functions include try-catch blocks. Customize error messages in:
- `handleCreateUser` (line ~157)
- `handleUpdateUser` (line ~286)
- `handleDisableUser` (line ~218)

## Testing Checklist
- [ ] Backend API endpoints are running
- [ ] CORS is configured for frontend domain
- [ ] Database tables are created with `status` field
- [ ] API returns expected data format
- [ ] Error responses include `message` field
- [ ] Authentication (if required) is working
- [ ] Test CREATE operation (POST /api/users)
- [ ] Test READ operation (GET /api/users)
- [ ] Test UPDATE operation (PUT /api/users/:id)
- [ ] Test DISABLE operation (PATCH /api/users/:id/disable)

## Additional Features to Consider
1. **Search functionality**: Filter users on backend before sending
2. **Pagination**: Handle large user lists
3. **Sorting**: Let backend handle sorting
4. **Validation**: Add backend validation for email uniqueness
5. **Loading states**: Show spinners during API calls
6. **Toast notifications**: Replace alerts with better UX

## Support
For issues or questions, refer to:
- Frontend code comments (search for "TODO")
- `src/api/config.js` for API configuration
- Backend API documentation
