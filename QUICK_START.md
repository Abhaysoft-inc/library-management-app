# 🚀 Quick Start Guide

## Get Your Library Management System Running in 5 Minutes!

### Step 1: Install Dependencies ⚙️

```bash
# Navigate to the server directory
cd server

# Install server dependencies
npm install

# Navigate to the client directory
cd ../client

# Install client dependencies
npm install
```

### Step 2: Setup the Backend Database 🗄️

```bash
# Go back to server directory
cd ../server

# Run the interactive setup wizard
npm run setup
```

**What this does:**
- Connects to MongoDB
- Creates an admin user
- Optionally creates test users and sample books
- Shows database statistics

**Answer 'y' when prompted** if you want test data for development.

### Step 3: Start the Servers 🌐

**Open TWO terminal windows:**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Server will start on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
✅ Client will start on http://localhost:5173

### Step 4: Login 🔐

Open your browser and go to: http://localhost:5173

**Use these credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eelibrary.com | Admin@123456 |
| Librarian | librarian@eelibrary.com | Librarian@123 |
| Student | student@eelibrary.com | Student@123 |

*Note: Librarian and Student accounts are only available if you chose 'y' during setup.*

### Step 5: Explore! 🎉

You're all set! Start exploring the features:

- **Admin:** Manage users, books, and view all transactions
- **Librarian:** Add books, approve student registrations, manage transactions
- **Student:** Browse books, borrow/return books, view history

---

## 🆘 Troubleshooting

### MongoDB Not Running?

**Windows:**
1. Open Services (Win + R, type `services.msc`)
2. Find "MongoDB Server"
3. Right-click → Start

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Port Already in Use?

**Change Backend Port:**
Edit `server/.env`:
```
PORT=3000
```

**Change Frontend Port:**
Edit `client/vite.config.js` and add:
```javascript
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Connection Refused Error?

Make sure MongoDB is running and the connection string in `server/.env` is correct:
```
MONGODB_URI=mongodb://127.0.0.1:27017/library-management
```

### Can't Login?

Run the setup script again:
```bash
cd server
npm run setup
```

---

## 📚 What's Next?

1. **Change Passwords:** Go to your profile and change the default passwords
2. **Add Books:** Login as admin/librarian and add some books
3. **Test Features:** Try borrowing and returning books
4. **Customize:** Modify the code to fit your needs

---

## 🎯 Project Structure Quick Reference

```
library-management-app/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   └── store/       # Redux state
│   └── package.json
│
├── server/              # Express backend
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── services/        # Business logic
│   ├── setup.js         # Setup script
│   └── package.json
│
└── README.md            # Full documentation
```

---

## 💡 Useful Commands

### Backend
```bash
npm start          # Production mode
npm run dev        # Development mode (auto-reload)
npm run setup      # Interactive setup
npm run setup:full # Full setup with test data
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

---

**Need more help?** Check the full README.md or the server/README.md for detailed documentation.

**Happy Coding! 🎉**
