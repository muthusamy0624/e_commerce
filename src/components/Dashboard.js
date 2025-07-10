import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase-config";
import { collection, onSnapshot } from "firebase/firestore";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [search, setSearch] = useState("");
  const [orderList, setOrderList] = useState([]);
  const [queryList, setQueryList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setCurrentDate(new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Fetch orders from Firestore
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrderList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    // For now, use the same static queries as Queries.js
    setQueryList([
      { id: 1, customer: "John Doe", email: "john@example.com", subject: "Product Inquiry", message: "I'm interested in the luxury watch collection. Do you have any discounts available?", status: "New", date: "2023-05-15", priority: "High" },
      { id: 2, customer: "Jane Smith", email: "jane@example.com", subject: "Order Status", message: "I placed an order last week but haven't received any updates. Can you check the status?", status: "In Progress", date: "2023-05-14", priority: "Medium" },
      { id: 3, customer: "Mike Johnson", email: "mike@example.com", subject: "Return Request", message: "I received a damaged item and would like to return it. What's the process?", status: "Resolved", date: "2023-05-13", priority: "High" },
      { id: 4, customer: "Sarah Wilson", email: "sarah@example.com", subject: "Size Availability", message: "Do you have the designer bag in size M? It's showing out of stock online.", status: "New", date: "2023-05-12", priority: "Low" },
      { id: 5, customer: "David Brown", email: "david@example.com", subject: "Payment Issue", message: "I'm having trouble with the payment gateway. It keeps declining my card.", status: "In Progress", date: "2023-05-11", priority: "High" },
      { id: 6, customer: "Emily Davis", email: "emily@example.com", subject: "Shipping Question", message: "What are your international shipping rates and delivery times?", status: "Resolved", date: "2023-05-10", priority: "Medium" },
    ]);
    return () => unsubscribeOrders();
  }, []);

  // Only show orders for the current user
  const userOrders = user ? orderList.filter(order => order.userEmail === user.email) : [];
  const totalOrders = userOrders.length;
  const totalQueries = queryList.length;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigation = (route) => {
    navigate(route);
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(191, 168, 87, 0.1)',
        },
        ticks: {
          color: '#bfa857',
        },
      },
      y: {
        grid: {
          color: 'rgba(191, 168, 87, 0.1)',
        },
        ticks: {
          color: '#bfa857',
        },
      },
    },
  };

  const topProducts = [
    { name: "Luxury Watch", sales: 156, revenue: "$12,400" },
    { name: "Designer Bag", sales: 89, revenue: "$8,900" },
    { name: "Premium Perfume", sales: 67, revenue: "$6,700" },
    { name: "Gold Necklace", sales: 45, revenue: "$4,500" },
  ];

  const recentOrders = [
    { id: "#ORD-001", customer: "John Doe", status: "Delivered", date: "2023-05-15", amount: "$1,200" },
    { id: "#ORD-002", customer: "Jane Smith", status: "Processing", date: "2023-05-14", amount: "$850" },
    { id: "#ORD-003", customer: "Mike Johnson", status: "Shipped", date: "2023-05-13", amount: "$2,100" },
    { id: "#ORD-004", customer: "Sarah Wilson", status: "Delivered", date: "2023-05-12", amount: "$950" },
  ];

  const popularProducts = [
    { name: "Luxury Watch", image: "⌚", price: "$1,200", sales: 156 },
    { name: "Designer Bag", image: "👜", price: "$850", sales: 89 },
    { name: "Premium Perfume", image: "💎", price: "$450", sales: 67 },
    { name: "Gold Necklace", image: "📿", price: "$2,100", sales: 45 },
  ];

  const recentReviews = [
    { name: "John Doe", rating: 5, comment: "Excellent quality and fast delivery!" },
    { name: "Jane Smith", rating: 5, comment: "Beautiful products, highly recommended." },
    { name: "Mike Johnson", rating: 4, comment: "Great service and premium items." },
  ];

  // Filtered data
  const filteredTopProducts = topProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  // Use userOrders for recent orders table
  const filteredRecentOrders = userOrders.filter(o =>
    (o.customer && o.customer.toLowerCase().includes(search.toLowerCase())) ||
    (o.id && o.id.toLowerCase().includes(search.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="bg-[var(--bg-dark)] min-h-screen flex items-center justify-center">
        <div className="text-[var(--gold-primary)] text-xl">Loading...</div>
      </div>
    );
  }

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
          {/* Scroll indicator */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-luxe-gold/10 to-transparent pointer-events-none z-10"></div>
          
          <button 
            onClick={() => handleNavigation("/dashboard")}
            className="w-full flex items-center p-3 rounded-lg bg-luxe-dark text-luxe-gold hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="ml-3">Dashboard</span>
          </button>
          <button 
            onClick={() => handleNavigation("/products")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="ml-3">Products</span>
          </button>
          <button 
            onClick={() => handleNavigation("/orders")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="ml-3">Orders</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-luxe-gold/10 text-xs text-luxe-gold">0</span>
          </button>
          <button 
            onClick={() => handleNavigation("/queries")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="ml-3">Queries</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-xs text-red-400">0</span>
          </button>
          <button 
            onClick={() => handleNavigation("/analytics")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="ml-3">Analytics</span>
          </button>
          <button 
            onClick={() => handleNavigation("/settings")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="ml-3">Settings</span>
          </button>
          
          {/* Bottom scroll indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-luxe-gold/10 to-transparent pointer-events-none z-10"></div>
        </nav>

        {/* Fixed Bottom Section - Always Visible */}
        <div className="mt-4 p-3 border-t border-luxe-gold/20">
          <div className="flex items-center p-3 rounded-lg bg-luxe-dark/50 mb-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-luxe-gold/20 flex items-center justify-center text-luxe-gold">
                <span>{user.email ? user.email[0].toUpperCase() : 'A'}</span>
              </div>
              <div className="notification-dot"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.displayName || 'Admin User'}</p>
              <p className="text-xs text-luxe-gold-muted">{user.email}</p>
            </div>
          </div>
          
          {/* Enhanced Logout Button - Always Visible */}
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              LOGOUT
            </button>
            <p className="text-xs text-red-400 text-center mt-2">Click to sign out and return to login</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="text-luxe-gold-muted">Welcome back, <span>{user.displayName || 'Admin'}</span>. Here's what's happening with Chosen One today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input type="text" placeholder="Search products/orders..." value={search} onChange={e => setSearch(e.target.value)} className="bg-luxe-dark/50 border border-luxe-gold/20 rounded-lg px-4 py-2 pl-10 text-luxe-gold-light focus:outline-none focus:ring-2 focus:ring-luxe-gold/50 focus:border-transparent w-64" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-luxe-gold-muted absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="p-2 rounded-full bg-luxe-dark/50 border border-luxe-gold/20 hover:bg-luxe-gold/10 transition relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-luxe-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="notification-dot"></div>
            </button>
            <button className="flex items-center space-x-2 bg-luxe-dark/50 border border-luxe-gold/20 hover:bg-luxe-gold/10 transition px-4 py-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-luxe-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{currentDate}</span>
            </button>
            
            {/* Additional Logout Button in Header */}
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-luxe-gold-muted">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">$24,780</h3>
              </div>
              <div className="p-3 rounded-full bg-luxe-gold/10 text-luxe-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-luxe-gold-muted mt-3"><span className="text-luxe-gold">↑ 18.2%</span> from last month</p>
          </div>
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-luxe-gold-muted">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{totalOrders}</h3>
              </div>
              <div className="p-3 rounded-full bg-luxe-gold/10 text-luxe-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-luxe-gold-muted mt-3"><span className="text-luxe-gold">↑ 8.7%</span> from last month</p>
          </div>
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-luxe-gold-muted">New Customers</p>
                <h3 className="text-2xl font-bold mt-1">324</h3>
              </div>
              <div className="p-3 rounded-full bg-luxe-gold/10 text-luxe-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-luxe-gold-muted mt-3"><span className="text-luxe-gold">↑ 12.3%</span> from last month</p>
          </div>
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-luxe-gold-muted">Conversion Rate</p>
                <h3 className="text-2xl font-bold mt-1">3.42%</h3>
              </div>
              <div className="p-3 rounded-full bg-luxe-gold/10 text-luxe-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-luxe-gold-muted mt-3"><span className="text-red-400">↓ 0.8%</span> from last month</p>
          </div>
        </div>

        {/* Charts and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Revenue Overview</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs rounded-full bg-luxe-gold/10 text-luxe-gold">Week</button>
                <button className="px-3 py-1 text-xs rounded-full bg-luxe-dark hover:bg-luxe-gold/10 transition">Month</button>
                <button className="px-3 py-1 text-xs rounded-full bg-luxe-dark hover:bg-luxe-gold/10 transition">Year</button>
              </div>
            </div>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Top Products */}
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Top Selling</h2>
              <button className="text-sm text-luxe-gold hover:text-luxe-gold-light transition">View All</button>
            </div>
            <div className="space-y-4 h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-luxe-gold/20 scrollbar-track-transparent">
              {filteredTopProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-luxe-dark/30">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-luxe-gold-muted">{product.sales} sales</p>
                  </div>
                  <p className="text-luxe-gold font-semibold">{product.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders and Popular Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <button className="text-sm text-luxe-gold hover:text-luxe-gold-light transition">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-luxe-gold-muted border-b border-luxe-gold/20">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentOrders.map((order, index) => (
                    <tr key={index} className="order-row border-b border-luxe-gold/10">
                      <td className="py-3">{order.id}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">{order.date}</td>
                      <td className="py-3 text-right font-semibold">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Products */}
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Popular Products</h2>
              <button className="text-sm text-luxe-gold hover:text-luxe-gold-light transition">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {popularProducts.map((product, index) => (
                <div key={index} className="product-card bg-luxe-dark/30 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{product.image}</div>
                  <p className="font-medium text-sm mb-1">{product.name}</p>
                  <p className="text-luxe-gold font-semibold">{product.price}</p>
                  <p className="text-xs text-luxe-gold-muted">{product.sales} sold</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Reviews</h2>
            <button className="text-sm text-luxe-gold hover:text-luxe-gold-light transition">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReviews.map((review, index) => (
              <div key={index} className="bg-luxe-dark/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-luxe-gold/20 flex items-center justify-center text-luxe-gold font-semibold mr-3">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{review.name}</p>
                    <div className="flex text-luxe-gold">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'text-luxe-gold' : 'text-luxe-gold-muted'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-luxe-gold-muted">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 