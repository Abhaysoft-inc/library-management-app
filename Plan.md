# Library Management System - Electrical Engineering Department

## 🎯 Project Overview
A comprehensive web-based library management system specifically designed for the Electrical Engineering Department to manage books, journals, research papers, and student interactions efficiently.

## 🏗️ System Architecture

### Frontend (React.js)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + Material-UI components
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Authentication**: JWT token-based

### Backend (Node.js)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Storage**: Multer for file uploads
- **Email Service**: Nodemailer
- **API Documentation**: Swagger/OpenAPI

## 👥 User Roles & Permissions

### 1. Super Admin
- System configuration and management
- Department-wide analytics and reports
- User role management
- System backup and maintenance

### 2. Librarian Admin
- Complete library operations control
- Book/resource management (CRUD)
- Student registration approval
- Fine management
- Generate reports and analytics
- Manage book categories and subjects

### 3. Student
- Browse and search library catalog
- Request book reservations
- View borrowing history
- Check due dates and fines
- Update personal profile
- Request book renewals

### 4. Faculty (Optional)
- Extended borrowing privileges
- Research paper access
- Special resource requests

## 🚀 Core Features

### Authentication & Authorization
- **Student Registration**
  - Email verification with EE department domain
  - Student ID validation
  - Profile creation with academic details
  - Account approval workflow

- **Login System**
  - Role-based authentication
  - Password reset functionality
  - Remember me option
  - Session management

### Student Panel Features
- **Dashboard**
  - Currently borrowed books
  - Due dates and notifications
  - Quick search functionality
  - Recent activities

- **Library Catalog**
  - Advanced search and filtering
  - Book details and availability
  - Category browsing (Electronics, Power Systems, Control Systems, etc.)
  - Book reviews and ratings

- **Book Management**
  - Reserve available books
  - Renew borrowed books
  - View borrowing history
  - Request specific books

- **Profile Management**
  - Update personal information
  - Change password
  - View fine history
  - Notification preferences

### Librarian Admin Panel Features
- **Dashboard**
  - Library statistics and analytics
  - Pending requests and notifications
  - Quick actions panel
  - System alerts

- **Book Management**
  - Add/Edit/Delete books
  - Bulk book import (CSV/Excel)
  - Book categorization
  - ISBN scanning integration
  - Stock management

- **Student Management**
  - View all registered students
  - Approve/Reject registrations
  - Student borrowing history
  - Manage student fines

- **Transaction Management**
  - Issue books to students
  - Return book processing
  - Fine calculation and management
  - Generate receipts

- **Reports & Analytics**
  - Borrowing statistics
  - Popular books report
  - Overdue books report
  - Student activity reports
  - Department-wise analytics

### Advanced Features
- **Notification System**
  - Email notifications for due dates
  - SMS alerts for overdue books
  - In-app notifications
  - Fine reminders

- **Search & Filter**
  - Advanced search with multiple criteria
  - Filter by author, category, availability
  - Barcode/QR code scanning
  - Voice search integration

- **Recommendation Engine**
  - Personalized book recommendations
  - Similar books suggestions
  - Popular books in department

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  studentId: String, // Unique EE dept ID
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // 'student', 'librarian', 'admin'
  phone: String,
  year: Number, // Academic year
  branch: String, // EE specialization
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Books Collection
```javascript
{
  _id: ObjectId,
  isbn: String,
  title: String,
  author: [String],
  category: String, // Electronics, Power, Control, etc.
  subject: String,
  publisher: String,
  publishedYear: Number,
  totalCopies: Number,
  availableCopies: Number,
  description: String,
  image: String, // Book cover URL
  location: String, // Shelf location
  addedBy: ObjectId, // Librarian ID
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  bookId: ObjectId,
  issueDate: Date,
  dueDate: Date,
  returnDate: Date,
  status: String, // 'issued', 'returned', 'overdue'
  fine: Number,
  renewalCount: Number,
  librarianId: ObjectId,
  notes: String
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String, // Electronics, Power Systems, etc.
  description: String,
  parentCategory: String,
  isActive: Boolean
}
```

## 🎨 UI/UX Design Guidelines

### Design System
- **Color Scheme**: Professional blue and white theme
- **Typography**: Inter/Roboto font family
- **Icons**: Heroicons/Material Icons
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant

### Key Pages
1. **Landing Page**: Department branding, quick access
2. **Login/Register**: Clean, professional forms
3. **Student Dashboard**: Card-based layout
4. **Book Catalog**: Grid/List view with filters
5. **Admin Panel**: Data tables and charts
6. **Profile Pages**: Tabbed interface
7. **Navigation Bar (Updated)**
   - Responsive and role-based navigation (Student, Librarian, Admin)
   - Includes animations, hover/active effects, and dropdowns
   - Gradient background for modern design
   - Profile dropdown and notifications integrated

## 📱 Technical Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [x] Project setup and configuration
- [ ] Database design and setup
- [ ] Authentication system
- [ ] Basic routing structure
- [ ] User registration and login

### Phase 2: Core Features (Week 3-4)
- [ ] Student panel development
- [ ] Book catalog and search
- [ ] Basic CRUD operations
- [ ] Librarian admin panel
- [ ] Book management system

### Phase 3: Advanced Features (Week 5-6)
- [ ] Transaction management
- [ ] Fine calculation system
- [ ] Notification system
- [ ] Reports and analytics
- [ ] File upload functionality

### Phase 4: Enhancement (Week 7-8)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing (Unit + Integration)
- [ ] Security enhancements
- [ ] Documentation

## 🔧 Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- Git
- VS Code (recommended)

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ee_library
DATABASE_NAME=ee_library

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Installation Commands
```bash
# Backend setup
cd server
npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer nodemailer

# Frontend setup
cd client
npm install @reduxjs/toolkit react-redux react-router-dom axios @mui/material @emotion/react @emotion/styled
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/verify-email/:token` - Email verification

### Books
- `GET /api/books` - Get all books (with pagination)
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Add new book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Students
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/:id` - Get student profile
- `PUT /api/students/:id` - Update student profile
- `POST /api/students/:id/approve` - Approve student (Admin only)

### Transactions
- `POST /api/transactions/issue` - Issue book
- `POST /api/transactions/return` - Return book
- `GET /api/transactions/student/:id` - Student's transactions
- `GET /api/transactions/overdue` - Overdue books

## 🚦 Testing Strategy
- **Unit Tests**: Jest for backend, React Testing Library for frontend
- **Integration Tests**: Supertest for API testing
- **E2E Tests**: Cypress for user workflows
- **Performance Tests**: Artillery for load testing

## 🔐 Security Measures
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Password hashing (bcrypt)
- JWT token expiration
- File upload restrictions

## 📈 Future Enhancements
- Mobile app development (React Native)
- Barcode scanning integration
- AI-powered book recommendations
- Integration with university systems
- Digital library resources
- Online book reading feature
- Multi-language support
- Dark mode theme

## 🎯 Success Metrics
- User adoption rate (>80% of EE students)
- Average response time (<2 seconds)
- System uptime (>99.5%)
- User satisfaction score (>4.5/5)
- Reduction in manual processes (>70%)

---

## 📝 Development Notes
- Follow React best practices and hooks
- Implement proper error handling
- Use TypeScript for type safety (optional)
- Maintain clean code standards
- Regular code reviews and testing
- Continuous integration/deployment

This plan provides a solid foundation for building a comprehensive library management system tailored for the Electrical Engineering Department.

### 🔄 Recent Updates
- Enhanced Navbar UI for better responsiveness and usability (October 2025)