"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

interface LoginProps {
    onSwitchToSignup: () => void;
}

export default function Login({ onSwitchToSignup }: LoginProps) {
    const router = useRouter();
    const db = getFirestore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user role from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            let userRole = "user"; // Default role

            if (userDocSnap.exists()) {
                userRole = userDocSnap.data().role || "user";
            }

            // Get ID token
            const idToken = await user.getIdToken();

            // Save token and role to localStorage
            localStorage.setItem("firebaseToken", idToken);
            localStorage.setItem("userId", user.uid);
            localStorage.setItem("userRole", userRole);

            // Redirect based on role
            if (userRole === "admin") {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            // Handle specific Firebase errors
            if (err.code === "auth/user-not-found") {
                setError("Email not registered");
            } else if (err.code === "auth/wrong-password") {
                setError("Incorrect password");
            } else if (err.code === "auth/invalid-email") {
                setError("Invalid email address");
            } else if (err.code === "auth/user-disabled") {
                setError("This account has been disabled");
            } else {
                setError("Login failed. Please try again.");
            }
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-6">Login to your account</p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <Eye className="w-5 h-5" />
                            ) : (
                                <EyeOff className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Forgot password?
                    </a>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 mt-6">
                Don't have an account?{" "}
                <button
                    onClick={onSwitchToSignup}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                    Sign up
                </button>
            </p>
        </div>
    );
}