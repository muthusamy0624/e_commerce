import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Queries from './components/Queries';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase-config';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="bg-[var(--bg-dark)] min-h-screen flex items-center justify-center">
        <div className="text-[var(--gold-primary)] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/products" 
            element={user ? <Products /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/orders" 
            element={user ? <Orders /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/queries" 
            element={user ? <Queries /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/settings" 
            element={user ? <Settings /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/analytics" 
            element={user ? <Analytics /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 