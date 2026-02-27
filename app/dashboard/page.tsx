// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface Booking {
    id: string;
    areaName?: string;
    courtName?: string;
    slots: Array<{ date: string; time: string[] }>;
    isApproved?: boolean | null;
    createdAt?: string;
    // add more fields if your backend returns them
}

interface Summary {
    totalBookings: number;
    totalHoursPlayed: number;
    upcomingSessions: number;
}

export default function DashboardHome() {
    const { user, loading: authLoading } = useAuth();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    const router = useRouter();

    const [summary, setSummary] = useState<Summary>({
        totalBookings: 0,
        totalHoursPlayed: 0,
        upcomingSessions: 0,
    });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                // No token needed anymore
                const userId = user.uid;

                // 1. Summary stats
                const summaryRes = await fetch(
                    `${apiBaseUrl}/api/dashboard/summary/?userId=${userId}`
                );

                if (!summaryRes.ok) {
                    const errText = await summaryRes.text();
                    throw new Error(`Summary failed: ${summaryRes.status} - ${errText}`);
                }

                const summaryData = await summaryRes.json();
                setSummary(summaryData);

                // 2. Recent bookings
                const recentRes = await fetch(
                    `${apiBaseUrl}/api/dashboard/recent-bookings/?userId=${userId}`
                );

                if (!recentRes.ok) {
                    const errText = await recentRes.text();
                    throw new Error(`Recent failed: ${recentRes.status} - ${errText}`);
                }

                const recentData = await recentRes.json();
                setRecentBookings(recentData.recentBookings || []);
            } catch (err: any) {
                console.error("Dashboard fetch error:", err);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, authLoading, router]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth");
        }
    }, [authLoading, user, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600 text-center py-10">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 shadow-xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                    Welcome back, {user?.displayName || "Player"}! 🎾
                </h1>
                <p className="text-blue-100 text-lg">
                    Ready to book your next pickleball session?
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Bookings"
                    value={summary.totalBookings}
                    icon="📅"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Hours Played"
                    value={summary.totalHoursPlayed}
                    icon="⏱️"
                    color="bg-green-500"
                />
                <StatCard
                    title="Upcoming Sessions"
                    value={summary.upcomingSessions}
                    icon="📅"
                    color="bg-purple-500"
                />
                {/* You can add more cards later */}
            </div>

            {/* Recent Bookings – only 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                    <button
                        onClick={() => router.push("/dashboard/bookings")}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                    >
                        View All →
                    </button>
                </div>

                {recentBookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No bookings yet. Start your first session!
                    </p>
                ) : (
                    <div className="space-y-4">
                        {recentBookings.map((booking) => (
                            <BookingItem
                                key={booking.id}
                                facility={booking.areaName || "Unknown Facility"}
                                court={booking.courtName}
                                date={booking.slots?.[0]?.date || "—"}
                                time={booking.slots?.[0]?.time || []}
                                isApproved={booking.isApproved}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// StatCard
interface StatCardProps {
    title: string;
    value: number | string;
    icon: string;
    color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <div
            className={`${color} text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow`}
        >
            <div className="text-4xl mb-3 opacity-90">{icon}</div>
            <p className="text-sm opacity-90 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

// BookingItem
interface BookingItemProps {
    facility: string;
    court?: string;
    date: string;
    time: string[];          // ← now accepts array of time strings
    isApproved?: boolean | null;
}

function BookingItem({ facility, court, date, time, isApproved }: BookingItemProps) {
    const mergedTimes = mergeTimeSlots(time);
    const displayTime = mergedTimes.length > 0
        ? mergedTimes.join(" and ")
        : "—";

    // Correct status handling (boolean true/false/null)
    const getStatusDisplay = (isApproved?: boolean | null) => {
        if (isApproved === true) return "Confirmed";
        if (isApproved === false) return "Rejected";
        return "Pending";
    };

    const displayStatus = getStatusDisplay(isApproved);

    const statusColor =
        displayStatus === "Confirmed"
            ? "bg-green-100 text-green-800 border-green-200"
            : displayStatus === "Rejected"
                ? "bg-red-100 text-red-800 border-red-200"
                : "bg-yellow-100 text-yellow-800 border-yellow-200";

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <div className="mb-3 sm:mb-0">
                <p className="font-semibold text-gray-900">{facility}</p>
                {court && <p className="text-sm text-gray-600 mt-1">{court}</p>}
                <p className="text-sm text-gray-600 mt-1">
                    {date} • {displayTime}
                </p>
            </div>
            <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium border ${statusColor}`}
            >
                {displayStatus}
            </span>
        </div>
    );
}

// Helper: Merge consecutive time slots
function mergeTimeSlots(times: string[]): string[] {
    if (times.length === 0) return [];

    // Sort times just in case
    const sortedTimes = [...times].sort();

    const merged: string[] = [];
    let currentStart = "";
    let currentEnd = "";

    for (const range of sortedTimes) {
        try {
            const [start, end] = range.split(" - ").map(s => s.trim());
            if (!currentStart) {
                currentStart = start;
                currentEnd = end;
                continue;
            }

            // If current end matches next start → merge
            if (currentEnd === start) {
                currentEnd = end;
            } else {
                // Push previous merged range
                merged.push(`${currentStart} - ${currentEnd}`);
                currentStart = start;
                currentEnd = end;
            }
        } catch {
            // Invalid range → push as-is
            merged.push(range);
        }
    }

    // Push the last range
    if (currentStart) {
        merged.push(`${currentStart} - ${currentEnd}`);
    }

    return merged;
}