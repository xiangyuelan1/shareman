import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { MemoriesPage } from '@/pages/MemoriesPage';
import { GrowthPage } from '@/pages/GrowthPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { PersonPage } from '@/pages/PersonPage';
import { LoginPage } from '@/pages/LoginPage';
import { AdminPage } from '@/pages/AdminPage';
import { XiaozhiPage } from '@/pages/XiaozhiPage';
import { PlazaPage } from '@/pages/PlazaPage';
import { MirrorPage } from '@/pages/MirrorPage';
import { authService } from '@/services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authState = authService.getAuthState();
    setIsAuthenticated(authState?.isAuthenticated || false);
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl animate-breathe flex items-center justify-center" 
               style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <span className="text-3xl">🚀</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = authService.isAdmin();

  return (
    <Router>
      <Layout onLogout={handleLogout} isAdmin={isAdmin}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/growth" element={<GrowthPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/xiaozhi" element={<XiaozhiPage />} />
          <Route path="/plaza" element={<PlazaPage />} />
          <Route path="/mirror" element={<MirrorPage />} />
          {isAdmin && <Route path="/admin" element={<AdminPage />} />}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
