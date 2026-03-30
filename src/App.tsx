import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/organisms/Navbar';
import { Header } from './components/organisms/Header';
import { DashboardPage } from './components/pages/DashboardPage';
import { TransactionsPage } from './components/pages/TransactionsPage';
import { CategoriesPage } from './components/pages/CategoriesPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <div className="app-content">
          <Header />
          <main className="app-main" id="page-container">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};
