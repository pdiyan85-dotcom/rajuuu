import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your primary UI / Main App component here
// Adjust the import path below if your main component is named differently (e.g., './Home' or './Main')
import MainApp from './MainApp'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Automatically redirect root "/" to your main component */}
        <Route path="/" element={<MainApp />} />

        {/* Fallback route for component previews */}
        <Route path="/preview/:componentName" element={<MainApp />} />

        {/* Catch-all redirect back to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
