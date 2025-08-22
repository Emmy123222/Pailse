import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ExamRegistrationPage from './pages/ExamRegistrationPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import DashboardPage from './pages/DashboardPage';
import ExamPage from './pages/ExamPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="exam-registration" element={<ExamRegistrationPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="exam" element={<ExamPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;