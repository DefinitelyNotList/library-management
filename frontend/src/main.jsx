import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

// Components
import ForgotPassword from "./components/ForgotPassword";
import LandingPage from "./components/LandingPage";
import LibrarioFooter from "./components/LibrarioFooter";
import Login from "./components/Login";
import MemberPenalty from "./components/MemberPenalty";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";

// Pages
import AddBook from "./pages/AddBook";
import AddLibrarian from "./pages/AddLibrarian";
import AdminAddMember from "./pages/AdminAddMember";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import BookCatalog from "./pages/BookCatalog";
import BookDetailPage from "./pages/BookDetailPage";
import BookForm from "./pages/BookForm";
import BookList from "./pages/BookList";
import BookManagement from "./pages/BookManagement";
import BookRequests from "./pages/BookRequests";
import BorrowingHistory from "./pages/BorrowingHistory";
import EditBook from "./pages/EditBook";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import LibrariansList from "./pages/LibrariansList";
import LibrarianTransactionHistory from "./pages/LibrarianTransactionHistory";
import ManageBooks from "./pages/ManageBooks";
import MemberDashboard from "./pages/MemberDashboard";
import MembersList from "./pages/MembersList";
import Unauthorized from "./pages/Unauthorized";

function Layout({ children }) {
  const location = useLocation();

  // Hide Navbar & Footer only on Landing Page
  const hideLayout = location.pathname === "/";

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <LibrarioFooter />}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing page without navbar/footer */}
      <Route path="/" element={<LandingPage />} />

      {/* All other routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/Reset-password" element={<ResetPassword />} />
      <Route path="/books" element={<BookList />} />
      <Route path="/add-book" element={<AddBook />} />
      <Route path="/book-catalog" element={<BookCatalog />} />
      <Route path="/librarian/manage-books" element={<ManageBooks />} />
      <Route path="/manage-books" element={<BookManagement />} />
      <Route path="/edit-book/:id" element={<EditBook />} />
      <Route path="/admin/add-librarian" element={<AddLibrarian />} />
      <Route path="/librarian/book-form" element={<BookForm />} />
      <Route path="/member-penalty" element={<MemberPenalty />} />
      <Route path="/borrowing-history" element={<BorrowingHistory />} />
      <Route path="/admin/librarians" element={<LibrariansList />} />
      <Route path="/admin/members-list" element={<MembersList />} />
      <Route path="/book-requests" element={<BookRequests />} />
      <Route
        path="/transactions/book/:bookId"
        element={<LibrarianTransactionHistory />}
      />
      <Route path="/admin/add-member" element={<AdminAddMember />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/books/:id" element={<BookDetailPage />} />

      {/* Dashboards */}
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute requiredRole="ADMIN">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/librarian-dashboard"
        element={
          <PrivateRoute requiredRole="LIBRARIAN">
            <LibrarianDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/member-dashboard"
        element={
          <PrivateRoute requiredRole="MEMBER">
            <MemberDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
