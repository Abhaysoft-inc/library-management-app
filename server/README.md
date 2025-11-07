# Library Management System - Backend

A robust Node.js/Express backend for the Library Management System with MongoDB database.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the server directory (or use the existing one):
   ```env
   # Database
   MONGODB_URI=mongodb://127.0.0.1:27017/library-management
   
   # JWT
   JWT_SECRET=your_super_secret_key_change_in_production
   JWT_EXPIRE=7d
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Email (Optional - for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   
   # Frontend
   CLIENT_URL=http://localhost:5173
   ```

3. **Setup the database**
   
   Run the interactive setup script:
   ```bash
   npm run setup
   ```
   
   Or for full setup with test data:
   ```bash
   npm run setup:full
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server in production mode |
| `npm run dev` | Start the server in development mode with nodemon |
| `npm run setup` | Interactive setup wizard (creates admin user) |
| `npm run setup:full` | Full setup with test users and sample books |

## 🔐 Default Credentials

After running the setup script, you'll have access to these accounts:

### Admin Account
- **Email:** admin@eelibrary.com
- **Password:** Admin@123456
- **Role:** Administrator

### Test Librarian (only with --full setup)
- **Email:** librarian@eelibrary.com
- **Password:** Librarian@123
- **Role:** Librarian

### Test Student (only with --full setup)
- **Email:** student@eelibrary.com
- **Password:** Student@123
- **Role:** Student

⚠️ **Important:** Change these passwords in production!

## 🏗️ Project Structure

```
server/
├── middleware/          # Authentication and validation middleware
│   └── auth.js
├── models/              # Mongoose models
│   ├── User.js
│   ├── Book.js
│   ├── Transaction.js
│   └── Category.js
├── routes/              # API routes
│   ├── auth.js          # Authentication routes
│   ├── books.js         # Book management routes
│   ├── students.js      # Student management routes
│   ├── transactions.js  # Transaction routes
│   └── migration.js     # Data migration routes
├── services/            # Business logic services
│   ├── emailService.js
│   └── notificationService.js
├── index.js             # Application entry point
├── setup.js             # Database setup script
├── package.json
└── .env                 # Environment variables
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (Admin/Librarian)
- `PUT /api/books/:id` - Update book (Admin/Librarian)
- `DELETE /api/books/:id` - Delete book (Admin/Librarian)

### Transactions
- `POST /api/transactions/issue` - Issue a book
- `POST /api/transactions/return` - Return a book
- `GET /api/transactions/history` - Get transaction history
- `GET /api/transactions/pending` - Get pending transactions

### Students (Admin/Librarian only)
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id/approve` - Approve student registration
- `PUT /api/students/:id/block` - Block/Unblock student

## 🛠️ Development

### Adding New Features

1. Create model in `models/` if needed
2. Add routes in `routes/`
3. Implement business logic in `services/` (optional)
4. Add middleware in `middleware/` if needed
5. Update documentation

### Database Schema

#### User Model
- Student ID, Name, Email, Password
- Role (student/librarian/admin)
- Phone, Year, Branch
- Approval and verification status

#### Book Model
- ISBN, Title, Author(s)
- Category, Subject, Description
- Publisher, Publication Year, Edition
- Total and available copies
- Location, Tags

#### Transaction Model
- User and Book references
- Issue/Due/Return dates
- Status, Fine amount
- Renewal count

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Or start MongoDB service
# Windows: services.msc -> MongoDB
# Linux: sudo systemctl start mongod
# Mac: brew services start mongodb-community
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3000
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/library-management` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | Required for emails |
| `SMTP_PASS` | Email password | Required for emails |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |

## 🔒 Security Best Practices

1. **Change default passwords** immediately in production
2. **Use strong JWT_SECRET** - generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Enable HTTPS** in production
4. **Use environment variables** for all sensitive data
5. **Keep dependencies updated** - run `npm audit` regularly
6. **Implement rate limiting** (already included)
7. **Use helmet** for security headers (already included)

## 📚 Dependencies

### Production Dependencies
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Request validation
- **multer** - File uploads
- **nodemailer** - Email service
- **node-cron** - Scheduled tasks

### Development Dependencies
- **nodemon** - Auto-reload during development

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the logs for error messages

---

Made with ❤️ for the Library Management System
