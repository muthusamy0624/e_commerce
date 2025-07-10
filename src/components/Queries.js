import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { signOut, onAuthStateChanged } from "firebase/auth";

const queries = [
  { id: 1, customer: "John Doe", email: "john@example.com", subject: "Product Inquiry", message: "I'm interested in the luxury watch collection. Do you have any discounts available?", status: "New", date: "2023-05-15", priority: "High" },
  { id: 2, customer: "Jane Smith", email: "jane@example.com", subject: "Order Status", message: "I placed an order last week but haven't received any updates. Can you check the status?", status: "In Progress", date: "2023-05-14", priority: "Medium" },
  { id: 3, customer: "Mike Johnson", email: "mike@example.com", subject: "Return Request", message: "I received a damaged item and would like to return it. What's the process?", status: "Resolved", date: "2023-05-13", priority: "High" },
  { id: 4, customer: "Sarah Wilson", email: "sarah@example.com", subject: "Size Availability", message: "Do you have the designer bag in size M? It's showing out of stock online.", status: "New", date: "2023-05-12", priority: "Low" },
  { id: 5, customer: "David Brown", email: "david@example.com", subject: "Payment Issue", message: "I'm having trouble with the payment gateway. It keeps declining my card.", status: "In Progress", date: "2023-05-11", priority: "High" },
  { id: 6, customer: "Emily Davis", email: "emily@example.com", subject: "Shipping Question", message: "What are your international shipping rates and delivery times?", status: "Resolved", date: "2023-05-10", priority: "Medium" },
];

const Queries = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuery, setNewQuery] = useState({ customer: "", email: "", subject: "", message: "", status: "New", date: "", priority: "Medium" });
  const [queryList, setQueryList] = useState(queries);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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

  // Search filter
  const filteredQueries = queryList.filter(q =>
    q.customer.toLowerCase().includes(search.toLowerCase()) ||
    q.email.toLowerCase().includes(search.toLowerCase()) ||
    q.subject.toLowerCase().includes(search.toLowerCase())
  );

  // Add Query Modal handlers
  const handleAddQuery = (e) => {
    e.preventDefault();
    setQueryList([
      ...queryList,
      { ...newQuery, id: queryList.length + 1 }
    ]);
    setShowAddModal(false);
    setNewQuery({ customer: "", email: "", subject: "", message: "", status: "New", date: "", priority: "Medium" });
  };

  const totalQueries = queryList.length;
  const newQueries = queryList.filter(q => q.status === "New").length;
  const inProgressQueries = queryList.filter(q => q.status === "In Progress").length;
  const resolvedQueries = queryList.filter(q => q.status === "Resolved").length;

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
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
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
            className="w-full flex items-center p-3 rounded-lg bg-luxe-dark text-luxe-gold hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="ml-3">Queries</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-xs text-red-400">6</span>
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

        <div className="mb-10 p-3 border-t border-luxe-gold/20">
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
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Customer Queries</h1>
            <p className="text-luxe-gold-muted">Manage and respond to customer inquiries</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input type="text" placeholder="Search queries..." value={search} onChange={e => setSearch(e.target.value)} className="bg-luxe-dark/50 border border-luxe-gold/20 rounded-lg px-4 py-2 pl-10 text-luxe-gold-light focus:outline-none focus:ring-2 focus:ring-luxe-gold/50 focus:border-transparent w-64" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-luxe-gold-muted absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Additional Logout Button in Header */}
            <button className="flex items-center space-x-2 bg-gradient-to-r from-luxe-gold to-yellow-500 text-luxe-black hover:from-yellow-500 hover:to-luxe-gold transition-all duration-300 px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl" onClick={() => setShowAddModal(true)}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg><span>Add Query</span></button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-luxe-gold-muted">Total Queries</p>
                <h3 className="text-2xl font-bold mt-1">{totalQueries}</h3>
              </div>
              <div className="p-3 rounded-full bg-luxe-gold/10 text-luxe-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-luxe-gold-muted mt-3"><span className="text-luxe-gold">{totalQueries > 0 ? `↑ ${(totalQueries / 100 * 100).toFixed(1)}%` : "0%"}</span> from last month</p>
          </div>
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-luxe-gold-muted">New</p>
                <h3 className="text-2xl font-bold mt-1">{newQueries}</h3>
              </div>
              <div className="p-3 rounded-full bg-red-500/10 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-luxe-gold-muted mt-3"><span className="text-red-400">{totalQueries > 0 ? `${((newQueries / totalQueries) * 100).toFixed(1)}%` : "0%"}</span> need attention</p>
          </div>
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-luxe-gold-muted">In Progress</p>
                <h3 className="text-2xl font-bold mt-1">{inProgressQueries}</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-luxe-gold-muted mt-3"><span className="text-blue-400">{totalQueries > 0 ? `${((inProgressQueries / totalQueries) * 100).toFixed(1)}%` : "0%"}</span> being handled</p>
          </div>
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-luxe-gold-muted">Resolved</p>
                <h3 className="text-2xl font-bold mt-1">{resolvedQueries}</h3>
              </div>
              <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-luxe-gold-muted mt-3"><span className="text-green-400">{totalQueries > 0 ? `${((resolvedQueries / totalQueries) * 100).toFixed(1)}%` : "0%"}</span> completed</p>
          </div>
        </div>

        {/* Queries Table */}
        <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Queries</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs rounded-full bg-luxe-gold/10 text-luxe-gold">All</button>
              <button className="px-3 py-1 text-xs rounded-full bg-luxe-dark hover:bg-luxe-gold/10 transition">New</button>
              <button className="px-3 py-1 text-xs rounded-full bg-luxe-dark hover:bg-luxe-gold/10 transition">In Progress</button>
              <button className="px-3 py-1 text-xs rounded-full bg-luxe-dark hover:bg-luxe-gold/10 transition">Resolved</button>
            </div>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-luxe-gold/20 scrollbar-track-transparent">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-luxe-gold-muted border-b border-luxe-gold/20">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((query) => (
                  <tr key={query.id} className="border-b border-luxe-gold/10">
                    <td className="py-4">
                      <div>
                        <p className="font-medium">{query.customer}</p>
                        <p className="text-sm text-luxe-gold-muted">{query.email}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium">{query.subject}</p>
                        <p className="text-sm text-luxe-gold-muted truncate max-w-xs">{query.message}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        query.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                        query.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {query.priority}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        query.status === 'Resolved' ? 'bg-green-500/20 text-green-400' :
                        query.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {query.status}
                      </span>
                    </td>
                    <td className="py-4">{query.date}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 rounded text-luxe-gold hover:bg-luxe-gold/10 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-1 rounded text-luxe-gold hover:bg-luxe-gold/10 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="p-1 rounded text-luxe-gold hover:bg-luxe-gold/10 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showAddModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"><div className="bg-luxe-dark p-8 rounded-xl border border-luxe-gold/20 w-full max-w-md relative"><button className="absolute top-2 right-2 text-luxe-gold" onClick={() => setShowAddModal(false)}>&times;</button><h2 className="text-xl font-bold mb-4">Add New Query</h2><form onSubmit={handleAddQuery} className="space-y-4"><input type="text" className="w-full rounded-lg px-4 py-2 bg-luxe-black border border-luxe-gold/20 text-luxe-gold-light" placeholder="Customer Name" value={newQuery.customer} onChange={e => setNewQuery({ ...newQuery, customer: e.target.value })} required /><input type="email" className="w-full rounded-lg px-4 py-2 bg-luxe-black border border-luxe-gold/20 text-luxe-gold-light" placeholder="Email" value={newQuery.email} onChange={e => setNewQuery({ ...newQuery, email: e.target.value })} required /><input type="text" className="w-full rounded-lg px-4 py-2 bg-luxe-black border border-luxe-gold/20 text-luxe-gold-light" placeholder="Subject" value={newQuery.subject} onChange={e => setNewQuery({ ...newQuery, subject: e.target.value })} required /><textarea className="w-full rounded-lg px-4 py-2 bg-luxe-black border border-luxe-gold/20 text-luxe-gold-light" placeholder="Message" value={newQuery.message} onChange={e => setNewQuery({ ...newQuery, message: e.target.value })} required></textarea><input type="date" className="w-full rounded-lg px-4 py-2 bg-luxe-black border border-luxe-gold/20 text-luxe-gold-light" value={newQuery.date} onChange={e => setNewQuery({ ...newQuery, date: e.target.value })} required /><select className="w-full rounded-lg px-4 py-2 bg-luxe-black border border-luxe-gold/20 text-luxe-gold-light" value={newQuery.status} onChange={e => setNewQuery({ ...newQuery, status: e.target.value })}><option>New</option><option>In Progress</option><option>Resolved</option></select><select className="w-full rounded-lg px-4 py-2 bg-luxe-black border border-luxe-gold/20 text-luxe-gold-light" value={newQuery.priority} onChange={e => setNewQuery({ ...newQuery, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select><button type="submit" className="w-full bg-gradient-to-r from-luxe-gold to-yellow-500 text-luxe-black font-semibold px-6 py-2 rounded-lg shadow hover:from-yellow-500 hover:to-luxe-gold transition">Add Query</button></form></div></div>)}
    </div>
  );
};

export default Queries; 