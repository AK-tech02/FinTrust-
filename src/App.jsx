import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LoanProvider, useLoan } from './context/LoanContext';
import Layout from './components/Layout';
import LoginSignup from './components/LoginSignup';
import Dashboard from './pages/Dashboard';
import CreateLoan from './pages/CreateLoan';
import LoansList from './pages/LoansList';
import LoanDetails from './pages/LoanDetails';
import UpdateLoan from './pages/UpdateLoan';
import Chatbot from './components/Chatbot';
import CustomCursor from './components/CustomCursor';
import PageTransition from './components/PageTransition';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useLoan();
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/loans" element={<PageTransition><LoansList /></PageTransition>} />
        <Route path="/create-loan" element={<PageTransition><CreateLoan /></PageTransition>} />
        <Route path="/loan/:id" element={<PageTransition><LoanDetails /></PageTransition>} />
        <Route path="/loan/:id/edit" element={<PageTransition><UpdateLoan /></PageTransition>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AnimatePresence>
  );
};

// Main App Content
const AppContent = () => {
  const { isAuthenticated } = useLoan();

  if (!isAuthenticated) {
    return <LoginSignup />;
  }

  return (
    <>
      <CustomCursor />
      <Layout>
        <Chatbot />
        <AnimatedRoutes />
      </Layout>
    </>
  );
};

function App() {
  useEffect(() => {
    console.log('Supabase client initialized:', supabase);
  }, []);
  return (
    <Router>
      <LoanProvider>
        <AppContent />
      </LoanProvider>
    </Router>
  );
}

export default App;
