# Library Management App

A full-stack library management system built with React (Vite) as the frontend and Express + MongoDB as the backend. The app implements role-based access (Admin, Librarian, Student), book catalog and transaction management (borrow/return), JWT authentication, and email notifications.

## 📁 Project Structure

- `client/` — React + Vite frontend
- `server/` — Express API and MongoDB models

## 🚀 Quick Start

### Prerequisites:

- Node.js 18+ and npm
- MongoDB (local or remote connection)

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd library-management-app
   ```

2. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory with the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/library-management
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   DEFAULT_BORROW_DAYS=14
   FINE_PER_DAY=5
   ```
   
   ⚠️ **Important:** Never commit `.env` files to version control!

4. **Initialize the database**
   ```bash
   cd server
   
   # Interactive setup (recommended for first-time)
   npm run setup
   
   # OR full setup with test users and sample books
   npm run setup:full
   ```

5. **Start the development servers**
   
   Open two terminal windows:
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔐 Default Login Credentials

After running the setup script:

- **Admin:** admin@eelibrary.com / Admin@123456
- **Librarian:** librarian@eelibrary.com / Librarian@123 *(full setup only)*
- **Student:** student@eelibrary.com / Student@123 *(full setup only)*

⚠️ Change these passwords after first login!

## 📦 Client (Frontend)

**Location:** `client/`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run Vite dev server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Tech Stack
- React 18
- React Router v6
- Redux Toolkit
- Tailwind CSS
- Vite

### Key Features
- Role-based dashboards
- Book browsing and search
- Transaction management
- User profile management
- Responsive design

## 🔧 Server (Backend)

**Location:** `server/`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run server (production) |
| `npm run dev` | Run with nodemon (development) |
| `npm run setup` | Interactive database setup |
| `npm run setup:full` | Full setup with test data |

### Tech Stack
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Nodemailer for emails
- Express Validator

### Project Structure
```
server/
├── middleware/     # Auth & validation
├── models/         # Mongoose schemas
├── routes/         # API endpoints
├── services/       # Business logic
├── setup.js        # Database setup script
└── index.js        # Entry point
```

## 📚 API Overview

### Endpoints

- **Authentication**
  - `POST /api/auth/login` — Login and receive JWT
  - `POST /api/auth/register` — Register new user
  - `POST /api/auth/forgot-password` — Request password reset
  - `POST /api/auth/reset-password/:token` — Reset password
  - `GET /api/auth/verify-email/:token` — Verify email

- **Books**
  - `GET /api/books` — List/search books
  - `GET /api/books/:id` — Get book details
  - `POST /api/books` — Add new book (Admin/Librarian)
  - `PUT /api/books/:id` — Update book (Admin/Librarian)
  - `DELETE /api/books/:id` — Delete book (Admin/Librarian)

- **Transactions**
  - `POST /api/transactions/issue` — Issue a book
  - `POST /api/transactions/return` — Return a book
  - `GET /api/transactions/history` — Get transaction history
  - `GET /api/transactions/pending` — Get pending transactions

- **Students** (Admin/Librarian only)
  - `GET /api/students` — List all students
  - `GET /api/students/:id` — Get student details
  - `PUT /api/students/:id/approve` — Approve registration
  - `PUT /api/students/:id/block` — Block/Unblock student

For detailed API documentation, see `server/README.md`.

## 🛠️ Development

### Common Tasks

**Adding a new feature:**
1. Update models if needed (`server/models/`)
2. Create/update routes (`server/routes/`)
3. Add frontend components (`client/src/components/`)
4. Update Redux slices if needed (`client/src/store/slices/`)

**Database migrations:**
- The setup script handles initial database setup
- For schema changes, create migration scripts in `server/routes/migration.js`

### Troubleshooting

**MongoDB connection issues:**
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB (varies by OS)
# Windows: services.msc -> MongoDB
# Linux: sudo systemctl start mongod
# Mac: brew services start mongodb-community
```

**Port already in use:**
- Change `PORT` in `server/.env`
- Change Vite port in `client/vite.config.js`

**Module errors:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🧪 Testing

The application includes:
- Input validation using express-validator
- JWT authentication middleware
- Rate limiting for security
- Error handling middleware

## 🚢 Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance
3. Generate strong `JWT_SECRET`
4. Configure SMTP for emails
5. Deploy to Heroku, AWS, DigitalOcean, Railway, etc.

### Frontend
1. Build: `npm run build` in `client/`
2. Deploy the `dist/` folder to Vercel, Netlify, AWS S3, etc.
3. Update API base URL in `client/src/services/api.js`

## 📝 Features

### User Roles
- **Admin:** Full system access, user management
- **Librarian:** Book management, approve transactions
- **Student:** Browse books, borrow/return, view history

### Key Functionality
- ✅ Role-based authentication & authorization
- ✅ Book catalog management
- ✅ Transaction tracking (issue/return)
- ✅ Email notifications
- ✅ Fine calculation
- ✅ User approval workflow
- ✅ Search and filtering
- ✅ Responsive UI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Support

For issues and questions:
- Check the troubleshooting section
- Review the server and client READMEs
- Create an issue in the repository

---

**Made with ❤️ for efficient library management**

