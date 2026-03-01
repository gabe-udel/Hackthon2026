"use client";

import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

type AuthMode = "login" | "signup";

export default function UserPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function validateForm() {
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  }

  function handleLogin() {
    if (!validateForm()) return;
    setSuccess(`Welcome back, ${email}!`);
    console.log("Login attempt:", { email, password });
    // Frontend only - store in localStorage for demo
    localStorage.setItem("user_email", email);
    localStorage.setItem("auth_token", `token_${Date.now()}`);
  }

  function handleSignup() {
    if (!validateForm()) return;
    setSuccess(`Account created for ${email}!`);
    console.log("Signup attempt:", { email, password });
    localStorage.setItem("user_email", email);
    localStorage.setItem("auth_token", `token_${Date.now()}`);
  }

  function handleGoogleLogin() {
    setSuccess("Redirecting to Google login...");
    console.log("Google login clicked");
    // Frontend simulation - redirect to Google OAuth
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = "openid email profile";
    const responseType = "code";
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    
    // For demo purposes, just store that user attempted Google login
    localStorage.setItem("pending_google_auth", "true");
    console.log("Google OAuth URL:", googleAuthUrl);
    
    // Uncomment below to actually redirect to Google
    // window.location.href = googleAuthUrl;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Savor</h1>
          <p className="text-sm text-slate-500">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        {/* EMAIL INPUT */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
            />
          </div>
        </div>

        {/* PASSWORD INPUT */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
            />
          </div>
        </div>

        {/* CONFIRM PASSWORD INPUT (Signup Only) */}
        {mode === "signup" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
              />
            </div>
          </div>
        )}

        {/* LOGIN/SIGNUP BUTTON */}
        <button
          onClick={mode === "login" ? handleLogin : handleSignup}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 mb-4 flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          {mode === "login" ? "Sign In" : "Create Account"}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-3 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 5.469a7.079 7.079 0 0 1 4.604 1.537 6.996 6.996 0 0 1 1.994 2.457h3.285a10.108 10.108 0 0 0-3.595-3.969A10.088 10.088 0 0 0 12 2a10.11 10.11 0 0 0-7.41 3.284A10.097 10.097 0 0 0 1 12a10.11 10.11 0 0 0 3.27 7.452A10.09 10.09 0 0 0 12 22c2.124 0 4.12-.582 5.858-1.611a9.996 9.996 0 0 0 3.595-3.97h-3.285a7.058 7.058 0 0 1-1.994 2.457A7.094 7.094 0 0 1 12 18.531a7.077 7.077 0 0 1-5.268-2.277A7.14 7.14 0 0 1 4 12a7.14 7.14 0 0 1 1.266-4.235Z"
            />
            <path
              fill="#34A853"
              d="M16.604 7.006c1.31 1.316 2.127 3.126 2.127 5.099 0 1.973-.817 3.783-2.127 5.099"
            />
            <path
              fill="#4285F4"
              d="M12 5.469a7.077 7.077 0 0 1 6.996 7.599h3.285A10.108 10.108 0 0 0 12 2a10.11 10.11 0 0 0-7.41 3.284A10.097 10.097 0 0 0 1 12a10.11 10.11 0 0 0 3.27 7.452"
            />
            <path
              fill="#FBBC05"
              d="M5.266 14.235A7.14 7.14 0 0 1 4 12a7.14 7.14 0 0 1 1.266-4.235"
            />
          </svg>
          <span>Google</span>
        </button>

        {/* TOGGLE BETWEEN LOGIN AND SIGNUP */}
        <div className="text-center text-sm text-slate-600">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setSuccess("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-green-600 font-semibold hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-green-600 font-semibold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* INFO BOX */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
          <strong>Demo Mode:</strong> This is a frontend-only authentication page. Credentials are stored in browser localStorage for demonstration purposes.
        </div>
      </div>
    </div>
  );
}
