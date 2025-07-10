import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import { collection, onSnapshot } from "firebase/firestore";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Analytics = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // Add this function to handle sidebar navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), snap => setOrders(snap.docs.map(doc => doc.data())));
    const unsubProducts = onSnapshot(collection(db, "products"), snap => setProducts(snap.docs.map(doc => doc.data())));
    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  // Revenue by month
  const revenueByMonth = {};
  orders.forEach(order => {
    const date = order.orderDate ? new Date(order.orderDate) : null;
    if (!date) return;
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const price = Number(order.productPrice && order.productPrice.replace(/[^0-9.]/g, "")) || 0;
    revenueByMonth[key] = (revenueByMonth[key] || 0) + price;
  });
  const revenueLabels = Object.keys(revenueByMonth).sort();
  const revenueData = revenueLabels.map(label => revenueByMonth[label]);

  // Top products
  const productSales = {};
  orders.forEach(order => {
    if (!order.productName) return;
    productSales[order.productName] = (productSales[order.productName] || 0) + 1;
  });
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // New customers (by email) per month
  const customerByMonth = {};
  orders.forEach(order => {
    const date = order.orderDate ? new Date(order.orderDate) : null;
    if (!date || !order.userEmail) return;
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    customerByMonth[key] = customerByMonth[key] || new Set();
    customerByMonth[key].add(order.userEmail);
  });
  const customerLabels = Object.keys(customerByMonth).sort();
  const customerData = customerLabels.map(label => customerByMonth[label].size);

  // Conversion rate (dummy: orders/1000 visits)
  const conversionRate = orders.length ? ((orders.length / 1000) * 100).toFixed(2) : "0.00";

  // Chart Data
  const revenueChart = {
    labels: revenueLabels,
    datasets: [{ label: "Revenue ($)", data: revenueData, backgroundColor: "#d4af37" }]
  };
  const topProductsChart = {
    labels: topProducts.map(([name]) => name),
    datasets: [{ label: "Sales", data: topProducts.map(([, count]) => count), backgroundColor: "#bfa857" }]
  };
  const customersChart = {
    labels: customerLabels,
    datasets: [{ label: "New Customers", data: customerData, backgroundColor: "#facc15" }]
  };

  return (
    <div className="bg-luxe-black font-sans text-luxe-gold-light min-h-screen flex overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-luxe-gold opacity-10 mix-blend-overlay filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-luxe-gold opacity-5 mix-blend-overlay filter blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/3 right-1/3 w-56 h-56 rounded-full bg-luxe-gold opacity-15 mix-blend-overlay filter blur-3xl animate-pulse-slow"></div>
      </div>
      {/* Sidebar */}
      <div className="sidebar glass-effect bg-luxe-dark/80 border-r border-luxe-gold/20 w-64 min-h-screen p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6 p-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-luxe-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="ml-2 text-xl font-bold gold-text-gradient">Chosen One</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-luxe-gold/20 scrollbar-track-transparent relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-luxe-gold/10 to-transparent pointer-events-none z-10"></div>
          <button onClick={() => handleNavigation("/dashboard")} className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="ml-3">Dashboard</span>
          </button>
          <button onClick={() => handleNavigation("/products")} className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="ml-3">Products</span>
          </button>
          <button onClick={() => handleNavigation("/orders")} className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="ml-3">Orders</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-luxe-gold/10 text-xs text-luxe-gold">0</span>
          </button>
          <button onClick={() => handleNavigation("/queries")} className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="ml-3">Queries</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-xs text-red-400">0</span>
          </button>
          <button onClick={() => handleNavigation("/analytics")} className="w-full flex items-center p-3 rounded-lg bg-luxe-dark text-luxe-gold hover:bg-luxe-gold/10 transition mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="ml-3">Analytics</span>
          </button>
          <button onClick={() => handleNavigation("/settings")} className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="ml-3">Settings</span>
          </button>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-luxe-gold/10 to-transparent pointer-events-none z-10"></div>
        </nav>
        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 mt-4">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            LOGOUT
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 p-8 max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-luxe-gold/20 scrollbar-track-transparent">
        <div className="flex flex-col items-center justify-center min-h-full">
          <div className="flex justify-between items-center mb-8 w-full max-w-4xl">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <div className="relative">
              <input type="text" placeholder="Search analytics..." value={search} onChange={e => setSearch(e.target.value)} className="bg-luxe-dark/50 border border-luxe-gold/20 rounded-lg px-4 py-2 pl-10 text-luxe-gold-light focus:outline-none focus:ring-2 focus:ring-luxe-gold/50 focus:border-transparent w-64" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-luxe-gold-muted absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl p-2">
            {/* Revenue Chart */}
            <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">💰</span>
              <h2 className="text-xl font-bold mb-2">Revenue</h2>
              <Bar data={revenueChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            {/* Top Products Chart */}
            <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">🏆</span>
              <h2 className="text-xl font-bold mb-2">Top Products</h2>
              <Bar data={topProductsChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            {/* New Customers Chart */}
            <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">👤</span>
              <h2 className="text-xl font-bold mb-2">New Customers</h2>
              <Line data={customersChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            {/* Conversion Rate */}
            <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">📈</span>
              <h2 className="text-xl font-bold mb-2">Conversion Rate</h2>
              <div className="text-4xl font-bold text-luxe-gold mb-2">{conversionRate}%</div>
              <div className="text-luxe-gold-muted text-sm">Orders / 1000 visits</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 