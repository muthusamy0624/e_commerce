import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { signOut, onAuthStateChanged, updateProfile, updatePassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Apply theme to root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    } else {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
    }
  }, [theme]);

  const loadUserSettings = async (user) => {
    setLoadingSettings(true);
    try {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      // Load theme from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().theme) {
        setTheme(userDoc.data().theme);
      }
      setMessage("");
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        setMessage("You are offline. Some settings may not be available until you reconnect.");
      } else {
        setMessage("Failed to load user settings: " + (error.message || error.code));
      }
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserSettings(user);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, retryCount]);

  const handleRetry = async () => {
    if (user) {
      setRetryCount((c) => c + 1);
      await loadUserSettings(user);
    }
  };

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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        await updateProfile(user, { displayName });
        setMessage("Profile updated successfully!");
      } catch (error) {
        setMessage("Error updating profile.");
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (user && password) {
      try {
        await updatePassword(user, password);
        setMessage("Password updated successfully!");
        setPassword("");
      } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
          setMessage("For security, please log out and log in again, then try changing your password.");
        } else if (error.code === 'auth/weak-password') {
          setMessage("Password should be at least 6 characters.");
        } else {
          setMessage(error.message || "Error updating password.");
        }
      }
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setMessage(`Theme set to ${newTheme}`);
    // Save theme to Firestore
    if (user) {
      await setDoc(doc(db, "users", user.uid), { theme: newTheme }, { merge: true });
    }
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    setMessage(`Notifications ${!notifications ? "enabled" : "disabled"}`);
  };

  const handleDeleteAccount = () => {
    setMessage("Account deletion is not implemented in this demo.");
  };

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
      <div className="sidebar glass-effect bg-luxe-dark/80 border-r border-luxe-gold/20 w-64 h-screen p-4 flex flex-col overflow-y-auto">
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
          <button onClick={() => handleNavigation("/analytics")} className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="ml-3">Analytics</span>
          </button>
          <button onClick={() => handleNavigation("/settings")} className="w-full flex items-center p-3 rounded-lg bg-luxe-dark text-luxe-gold hover:bg-luxe-gold/10 transition mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="ml-3">Settings</span>
          </button>
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
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <p className="text-luxe-gold-muted text-lg mb-8">Manage your account and application settings here.</p>
          <div className="glass-effect bg-luxe-dark/50 border border-luxe-gold/20 rounded-xl p-8 w-full max-w-2xl">
            {message && (
              <div className="mb-4 text-center text-luxe-gold bg-luxe-gold/10 rounded p-2 flex flex-col items-center">
                <span>{message}</span>
                {message.includes('offline') && (
                  <button
                    onClick={handleRetry}
                    className="mt-2 px-4 py-1 bg-gradient-to-r from-luxe-gold to-yellow-500 text-luxe-black rounded shadow hover:from-yellow-500 hover:to-luxe-gold transition"
                    disabled={loadingSettings}
                  >
                    {loadingSettings ? 'Retrying...' : 'Retry'}
                  </button>
                )}
              </div>
            )}
            <form onSubmit={handleProfileUpdate} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
              <div className="mb-4">
                <label className="block mb-1 text-luxe-gold">Display Name</label>
                <input type="text" className="w-full rounded-lg px-4 py-2 bg-luxe-dark/30 border border-luxe-gold/20 text-luxe-gold-light focus:outline-none focus:ring-2 focus:ring-luxe-gold/50" value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-luxe-gold">Email</label>
                <input type="email" className="w-full rounded-lg px-4 py-2 bg-luxe-dark/30 border border-luxe-gold/20 text-luxe-gold-light focus:outline-none focus:ring-2 focus:ring-luxe-gold/50" value={email} disabled />
              </div>
              <button type="submit" className="bg-gradient-to-r from-luxe-gold to-yellow-500 text-luxe-black font-semibold px-6 py-2 rounded-lg shadow hover:from-yellow-500 hover:to-luxe-gold transition">Update Profile</button>
            </form>
            <form onSubmit={handlePasswordChange} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Change Password</h2>
              <div className="mb-4">
                <label className="block mb-1 text-luxe-gold">New Password</label>
                <input type="password" className="w-full rounded-lg px-4 py-2 bg-luxe-dark/30 border border-luxe-gold/20 text-luxe-gold-light focus:outline-none focus:ring-2 focus:ring-luxe-gold/50" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="bg-gradient-to-r from-luxe-gold to-yellow-500 text-luxe-black font-semibold px-6 py-2 rounded-lg shadow hover:from-yellow-500 hover:to-luxe-gold transition">Change Password</button>
            </form>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Theme</h2>
              <button onClick={handleThemeToggle} className="bg-gradient-to-r from-luxe-gold to-yellow-500 text-luxe-black font-semibold px-6 py-2 rounded-lg shadow hover:from-yellow-500 hover:to-luxe-gold transition">
                Toggle to {theme === "dark" ? "Light" : "Dark"} Mode
              </button>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Notifications</h2>
              <button onClick={handleNotificationsToggle} className="bg-gradient-to-r from-luxe-gold to-yellow-500 text-luxe-black font-semibold px-6 py-2 rounded-lg shadow hover:from-yellow-500 hover:to-luxe-gold transition">
                {notifications ? "Disable" : "Enable"} Notifications
              </button>
            </div>
            <div className="mb-2">
              <h2 className="text-xl font-semibold mb-2 text-red-400">Danger Zone</h2>
              <button onClick={handleDeleteAccount} className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-red-600 hover:to-red-700 transition">Delete Account</button>
              <p className="text-xs text-red-400 mt-2">This action is not implemented in this demo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 