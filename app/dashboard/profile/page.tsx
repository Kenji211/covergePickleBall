// app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");           // Stores only the 10 digits
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Fetch Firestore user data
    useEffect(() => {
        if (!user || authLoading) return;

        const fetchUserData = async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setFirstName(data.firstName || "");
                    setLastName(data.lastName || "");

                    // Strip +63 when loading (store only digits)
                    let phoneNumber = data.phone || "";
                    if (phoneNumber.startsWith("+63")) {
                        phoneNumber = phoneNumber.substring(3);
                    }
                    setPhone(phoneNumber);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile data");
            }
        };

        fetchUserData();
    }, [user, authLoading]);

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setError("");
        setSuccess(false);

        try {
            // 1. Update Firebase Auth displayName
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
            await updateProfile(user, {
                displayName: fullName || null,
            });

            // 2. Update Firestore document
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim() ? `${phone.trim()}` : "",   // Save with +63
                updatedAt: new Date(),
            });

            setSuccess(true);
        } catch (err: any) {
            console.error("Profile update failed:", err);
            setError(err.message || "Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600 text-lg">Please log in to view your profile</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">

            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shrink-0">
                    {(firstName || lastName)?.charAt(0)?.toUpperCase() ||
                        user.displayName?.charAt(0)?.toUpperCase() ||
                        "?"}
                </div>

                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {firstName} {lastName}
                    </h2>
                    <p className="text-gray-600">{user.email}</p>
                </div>
            </div>

            {/* Form */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    Profile update failed
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    Profile updated successfully!
                </div>
            )}

            <div className="space-y-6">
                {/* First Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter your first name"
                    />
                </div>

                {/* Last Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter your last name"
                    />
                </div>

                {/* Email (read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={user.email || ""}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Phone Number with +63 prefix */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <div className="flex">
                        {/* Fixed +63 Prefix */}
                        <div className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-4 py-3 text-gray-600 font-medium flex items-center">
                            +63
                        </div>

                        {/* Input for 10 digits only */}
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                // Allow only numbers, max 10 digits
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhone(value);
                            }}
                            placeholder="9123456789"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Enter your 10-digit phone number (e.g. 9123456789)
                    </p>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving || authLoading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}