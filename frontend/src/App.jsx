import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ErrorBoundary from './components/common/ErrorBoundary';
import InboxPage from './pages/InboxPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}
