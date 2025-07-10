import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase-config";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const showMessage = (text, type) => setMessage({ text, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    showMessage("Signing in...", "info");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("Login successful! Redirecting...", "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      let msg = "Login failed.";
      switch (error.code) {
        case 'auth/user-not-found':
          msg = "No user found with this email. Please register first.";
          break;
        case 'auth/wrong-password':
          msg = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          msg = "Invalid email address format.";
          break;
        case 'auth/user-disabled':
          msg = "This user account has been disabled.";
          break;
        case 'auth/too-many-requests':
          msg = "Too many failed attempts. Please try again later or reset your password.";
          break;
        default:
          msg = error.message;
      }
      showMessage(msg, "error");
    }
  };

  const handleGoogleSignIn = async () => {
    showMessage("Signing in with Google...", "info");
    try {
      await signInWithPopup(auth, googleProvider);
      showMessage("Google sign-in successful! Redirecting...", "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  return (
    <div className="bg-[var(--bg-dark)] font-sans text-[var(--text-light)] min-h-screen flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {/* Main card */}
      <div className="glass-effect shadow-[0_20px_50px_-10px_rgba(212,175,55,0.15)] rounded-2xl p-8 max-w-md w-full relative overflow-hidden">
        {/* Custom Logo */}
        <div className="roi-logo">
          <div className="logo-icon">
            <svg className="chart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 20V10M18 20V4M6 20v-4"/>
            </svg>
          </div>
          <div className="logo-text">Chosen <span>One</span></div>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-center gold-text-gradient mb-1">Sign In</h1>
          <p className="text-[var(--gold-light)] text-sm">Welcome to Chosen One Portal</p>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center mb-6 border border-gray-300"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--gold-primary)]/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[var(--bg-card)] text-[var(--gold-light)]">Or continue with email</span>
          </div>
        </div>

        {/* Sign In form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--gold-light)]">Email</label>
            <input
              id="email"
              type="email"
              className="simple-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--gold-light)]">Password</label>
            <input
              id="password"
              type="password"
              className="simple-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg font-semibold text-[var(--bg-card)] hover:shadow-lg hover:shadow-[var(--gold-primary)]/30 transition-all duration-300 flex items-center justify-center gold-button mt-6"
          >
            <span className="relative z-10">LOGIN</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--gold-primary)]/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[var(--bg-card)] text-[var(--gold-light)]">Don't have an account?</span>
          </div>
        </div>

        <div className="text-center">
          <Link to="/register" className="text-sm font-medium text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Create new account
          </Link>
        </div>

        {message.text && (
          <p
            className={`text-center mt-4 text-sm font-medium ${
              message.type === "error"
                ? "text-red-400"
                : message.type === "success"
                ? "text-green-400"
                : "text-[var(--gold-primary)]"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login; 