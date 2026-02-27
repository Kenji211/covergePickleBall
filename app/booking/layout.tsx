// app/booking/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthProvider } from "@/lib/auth-context";

export default function BookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is logged in
                setIsAuthenticated(true);
            } else {
                // Not logged in → redirect to login/auth page
                router.replace("/auth?redirect=/booking");
            }
            setIsChecking(false);
        });

        // Cleanup listener
        return () => unsubscribe();
    }, [router]);

    // Show loading while checking auth state
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If not authenticated → don't render children (redirect already happened)
    if (!isAuthenticated) {
        return null;
    }

    // Authenticated → show the booking content
    return (
        <div className="flex-1 w-full min-h-screen bg-gray-50">
            <AuthProvider>
                <main className="w-full">
                    {children}
                </main>
            </AuthProvider>
        </div>
    );
}