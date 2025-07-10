import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase-config";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ width: 0, color: "", text: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const showMessage = (text, type) => setMessage({ text, type });

  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Update strength indicator
    const width = (strength / 5) * 100;
    let color, text;
    
    if (strength <= 1) {
      color = "bg-red-500";
      text = "Weak password";
    } else if (strength <= 3) {
      color = "bg-yellow-500";
      text = "Moderate password";
    } else {
      color = "bg-green-500";
      text = "Strong password";
    }
    
    setPasswordStrength({ width, color, text });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      showMessage("Passwords don't match!", "error");
      return;
    }
    
    // Validate terms checkbox
    if (!termsAccepted) {
      showMessage("You must accept the terms and conditions", "error");
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      showMessage("Password must be at least 8 characters", "error");
      return;
    }

    showMessage("Creating account...", "info");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showMessage("Registration successful! Redirecting...", "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      showMessage(error.message, "error");
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
    <div className="bg-[var(--bg-dark)] font-sans text-[var(--text-light)] min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {/* Main card with reduced padding */}
      <div className="glass-effect shadow-[0_20px_50px_-10px_rgba(212,175,55,0.15)] rounded-2xl p-6 max-w-md w-full relative overflow-hidden">
        {/* Header with enhanced logo */}
        <div className="flex flex-col items-center mb-6">
          {/* Premium Logo Container */}
          <div className="relative mb-4 group">
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-[var(--gold-primary)] opacity-20 blur-md -z-10 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Gold border gradient */}
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] flex items-center justify-center shadow-lg">
              {/* Inner circle with dark background */}
              <div className="w-full h-full rounded-full bg-[var(--bg-card)] flex items-center justify-center">
                {/* Crown icon with gradient */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 gold-text-gradient" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 16h14v3H5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            
            {/* Small decorative elements */}
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--gold-primary)] opacity-80"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[var(--gold-secondary)] opacity-80"></div>
          </div>
          
          <h1 className="text-2xl font-bold text-center gold-text-gradient mb-1">Create Account</h1>
          <p className="text-sm text-[var(--gold-light)]">Join our exclusive community</p>
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
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--gold-primary)]/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[var(--bg-card)] text-[var(--gold-light)]">Or continue with email</span>
          </div>
        </div>

        {/* Registration form with adjusted spacing */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--gold-light)]">Email Address</label>
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
              placeholder="Create a password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <div 
              className={`password-strength mt-2 rounded-full ${passwordStrength.color}`}
              style={{ width: `${passwordStrength.width}%` }}
            ></div>
            <p className="text-xs text-[var(--gold-light)] mt-1">
              {password.length > 0 ? passwordStrength.text : "Use at least 8 characters with numbers and symbols"}
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--gold-light)]">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className="simple-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="h-4 w-4 text-[var(--gold-primary)] focus:ring-[var(--gold-primary)] border-[var(--gold-light)] rounded"
              />
            </div>
            <label htmlFor="terms" className="ml-2 block text-sm text-[var(--gold-light)]">
              I agree to the{" "}
              <button type="button" className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] transition underline">
                Terms
              </button>{" "}
              and{" "}
              <button type="button" className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] transition underline">
                Privacy Policy
              </button>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg font-semibold text-[var(--bg-card)] hover:shadow-lg hover:shadow-[var(--gold-primary)]/30 transition-all duration-300 flex items-center justify-center gold-button mt-4"
          >
            <span className="relative z-10">CREATE ACCOUNT</span>
          </button>
        </form>

        {/* Divider with reduced margin */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--gold-primary)]/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[var(--bg-card)] text-[var(--gold-light)]">Already a member?</span>
          </div>
        </div>

        {/* Sign in link - now properly visible */}
        <div className="text-center pb-2">
          <Link to="/login" className="text-sm font-medium text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Sign in to your account
          </Link>
        </div>

        {message.text && (
          <p
            className={`text-center mt-2 text-sm font-medium ${
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

export default Register; 