import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { getCurrentUser } from "./store/slices/authSlice";

// Import components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoleDashboard from "./pages/RoleDashboard";
import BooksPage from "./pages/BooksPage";
import BookDetailsPage from "./pages/BookDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDashboardNew from "./pages/AdminDashboardNew";
import BooksManagement from "./pages/BooksManagement";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import Categories from "./pages/Categories";
import StudentsManagement from "./pages/StudentsManagement";
import PendingStudents from "./pages/PendingStudents";
import ApprovedStudents from "./pages/ApprovedStudents";
import IssueBook from "./pages/IssueBook";
import ReturnBook from "./pages/ReturnBook";
import TransactionHistory from "./pages/TransactionHistory";
import FineManagement from "./pages/FineManagement";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Layout wrapper component to conditionally show navbar
function Layout({ children }) {
  const location = useLocation();

  // Hide navbar on admin routes
  const hideNavbar = location.pathname.startsWith('/admin') ||
    location.pathname === '/dashboard';

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      store.dispatch(getCurrentUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/books"
                element={
                  <ProtectedRoute>
                    <BooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/books/:id"
                element={
                  <ProtectedRoute>
                    <BookDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Role-specific Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <BooksManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books/add"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AddBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books/edit/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <EditBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <StudentsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/pending"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <PendingStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/approved"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ApprovedStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions/issue"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <IssueBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions/return"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ReturnBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions/history"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TransactionHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fines"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FineManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/librarian"
                element={
                  <ProtectedRoute requiredRole={["librarian", "admin"]}>
                    <LibrarianDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              ></Route>
              <Route
                path="/reset-password/:token"
                element={<ResetPasswordPage />}
              ></Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
