"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  MapPin,
  Mail,
  Loader2,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { ALGERIAN_WILAYAS } from "@/data";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { lang } = useLang();
  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const router = useRouter();
  // Signup state
  const [signupFullName, setSignupFullName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupWilaya, setSignupWilaya] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Validation
  const [phoneError, setPhoneError] = useState("");

  // Validate Algerian phone number
  const validatePhone = (phone: string): boolean => {
    // Remove spaces and format
    const cleanPhone = phone.replace(/\s/g, "");

    // Check if it starts with 0 and second digit is 5, 6, or 7
    if (cleanPhone.length === 10 && cleanPhone.startsWith("0")) {
      const secondDigit = cleanPhone[1];
      if (["5", "6", "7"].includes(secondDigit)) {
        setPhoneError("");
        return true;
      }
    }

    setPhoneError("Phone must start with 05, 06, or 07");
    return false;
  };

  // Format phone as user types
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
  };

  const handleLoginPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 10) {
      setLoginPhone(formatted);
    }
  };

  const handleSignupPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 10) {
      setSignupPhone(formatted);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(loginPhone)) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: loginPhone,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid credentials");
        return;
      }

      // Login successful
      toast.success("Login successful!");
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(data.user));
      // Cookie is already set by backend
      // Redirect user
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(signupPhone)) return;
    setIsLoading(true);
    if (signupPassword !== signupConfirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: signupPhone,
          name: signupFullName,
          wilaya: signupWilaya,
          address: signupAddress,
          password: signupPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      // Success
      toast.success("Account created successfully!");
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(data.user));
      // Since your backend already logs the user in (sets JWT cookie)
      // You can redirect directly to dashboard/home
      router.push("/");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <img
              src="/Velo-tebassa-Logo.png"
              alt="Velo Tebessa"
              className="w-12 h-12 object-contain"
            />
          </div>
          <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-1">
            Velo Tebessa
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-gray-400">
            {isLogin
              ? "Sign in to your account to continue"
              : "Fill in your details to get started"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {isLogin ? (
            /* ── LOGIN FORM ── */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={handleLoginPhoneChange}
                    placeholder="0XXX XX XX XX"
                    className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
                {phoneError && loginPhone && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">
                    {phoneError}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1.5">
                  Must start with 05, 06, or 07
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-gray-800 placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                {isLoading ? "Signing in…" : "Sign In"}
              </button>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-teal-600 font-bold hover:text-teal-700 transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </form>
          ) : (
            /* ── SIGNUP FORM ── */
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={handleSignupPhoneChange}
                    placeholder="0XXX XX XX XX"
                    className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
                {phoneError && signupPhone && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">
                    {phoneError}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1.5">
                  Must start with 05, 06, or 07
                </p>
              </div>

              {/* Wilaya */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Wilaya <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={signupWilaya}
                    onChange={(e) => setSignupWilaya(e.target.value)}
                    className="w-full pl-10 pr-9 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all appearance-none bg-white cursor-pointer font-medium text-gray-800"
                    required
                  >
                    <option value="">Select your wilaya</option>
                    {ALGERIAN_WILAYAS.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.name}>
                        {wilaya.code} - {wilaya.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Address{" "}
                  <span className="text-gray-300 font-medium normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <textarea
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    placeholder="Enter your address"
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all resize-none font-medium text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-11 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-gray-800 placeholder-gray-400"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-11 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-gray-800 placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                {isLoading ? "Creating account…" : "Create Account"}
              </button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-teal-600 font-bold hover:text-teal-700 transition-colors"
                >
                  Sign In
                </button>
              </p>

              <Link
                href={`/${{ lang }}/`}
                className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-teal-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
