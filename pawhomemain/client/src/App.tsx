import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader } from './components/common/Loader';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { SplashPage } from './pages/SplashPage';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PetsPage } from './pages/PetsPage';
import { PetDetailPage } from './pages/PetDetailPage';
import { MoodScannerPage } from './pages/MoodScannerPage';
import { FoodPage } from './pages/FoodPage';
import { VeterinaryPage } from './pages/VeterinaryPage';
import { SalonPage } from './pages/SalonPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { HealthPage } from './pages/HealthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF9]">
        <Loader message="Checking PawHome credentials..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. Splash Screen */}
      <Route path="/" element={<SplashPage />} />

      {/* 2. Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 3. Protected Application Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pets" element={<PetsPage />} />
        <Route path="/pets/:id" element={<PetDetailPage />} />
        <Route path="/mood-scanner" element={<MoodScannerPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/veterinary" element={<VeterinaryPage />} />
        <Route path="/salon" element={<SalonPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 4. Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
