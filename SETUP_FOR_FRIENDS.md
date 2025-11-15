# Database Setup Instructions for Your Friend

## Step 1: Install Node Modules

Open PowerShell/Terminal in the project folder and run:

```powershell
cd backend
npm install
```

This will install:
- express
- cors
- mysql2
- dotenv

## Step 2: Create .env File

Create a file called `.env` in the `backend` folder with this content:

```
# Database Configuration (MAMP)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=HMS
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Important:** If using MAMP, the port might be 8889 instead of 3306. Check MAMP preferences!

## Step 3: Start MAMP/XAMPP

1. Open MAMP or XAMPP
2. Click "Start Servers"
3. Make sure MySQL shows green/running

## Step 4: Import Database

1. Open phpMyAdmin: http://localhost:8888/phpMyAdmin (or http://localhost/phpmyadmin)
2. Click "Import" tab
3. Choose file: `database/database.sql`
4. Click "Go"
5. Import second file: `database/synthetic data.sql`
6. Click "Go"

## Step 5: Test Connection

```powershell
cd backend
node test-connection.js
```

You should see:
```
✅ Connection SUCCESS!
✅ HMS database exists!
✅ Found 12 tables in HMS database
```

## Step 6: Start Backend Server

```powershell
cd backend
node server.js
```

## Step 7: Start Frontend (in new terminal)

```powershell
npm start
```

## Troubleshooting

### Error: "ECONNREFUSED"
- MAMP/MySQL is not running
- Start MAMP and make sure MySQL has green light

### Error: "ER_ACCESS_DENIED_ERROR"
- Wrong username/password
- Try changing `.env` to `DB_PASSWORD=` (empty) or check MAMP settings

### Error: "ER_BAD_DB_ERROR"
- Database HMS doesn't exist
- Import database.sql and synthetic data.sql files

### Error: Module not found
- Run `npm install` in the backend folder
- Also run `npm install` in the main project folder for React

### Wrong Port
- MAMP default is sometimes 8889, not 3306
- Check MAMP → Preferences → Ports
- Update `.env` file with correct port number
