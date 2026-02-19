"use client";

import { useState } from "react";
import Login from "./login";
import Signup from "./signup";

export default function LoginSignup() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Content */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {isLogin ? (
                        <Login onSwitchToSignup={() => setIsLogin(false)} />
                    ) : (
                        <Signup onSwitchToLogin={() => setIsLogin(true)} />
                    )}
                </div>
            </div>
        </div>
    );
}