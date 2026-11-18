import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminJobEditPage } from './pages/admin/AdminJobEditPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Route Guard & Layout
import { AdminRouteGuard } from './components/admin/AdminRouteGuard';
import { AdminLayout } from './components/admin/AdminLayout';
import { ScrollToAnchor } from './components/common/ScrollToAnchor';

// Layout wrapper to show public Navbar & Footer only on public pages
const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToAnchor />
      {!isAdminRoute && <Navbar />}
      <div className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/wedding" element={<PortfolioPage defaultCategory="wedding" />} />
          <Route path="/ordination" element={<PortfolioPage defaultCategory="ordination" />} />
          <Route path="/events" element={<PortfolioPage defaultCategory="events" />} />
          <Route path="/category/:categorySlug" element={<PortfolioPage />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/job/:jobId"
            element={
              <AdminRouteGuard>
                <AdminLayout>
                  <AdminJobEditPage />
                </AdminLayout>
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRouteGuard>
                <AdminLayout>
                  <AdminSettingsPage />
                </AdminLayout>
              </AdminRouteGuard>
            }
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
