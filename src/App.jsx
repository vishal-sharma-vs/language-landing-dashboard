import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LanguagePage from './pages/LanguagePage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/language" replace />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/landing-page" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
