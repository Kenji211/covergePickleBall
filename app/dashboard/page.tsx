"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
    Menu,
    PanelRight,
    LogOut,
    Home,
    Calendar,
    User,
    Bell,
    Crown,
    Check,
} from "lucide-react";

export default function DashboardLayout() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState("home");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser) {
                router.push("/auth");
                return;
            }
            setUser({
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                uid: firebaseUser.uid,
            });
            setLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("firebaseToken");
            localStorage.removeItem("userId");
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? "w-64" : "w-20"
                    } bg-gray-900 text-white flex flex-col overflow-y-auto`}
            >
                {/* Logo */}
                <div className="p-6 flex items-center justify-between">
                    <h1
                        className={`font-bold text-xl ${!sidebarOpen && "hidden"
                            }`}
                    >
                        PickBook
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 hover:bg-gray-800 rounded-lg"
                    >
                        {sidebarOpen ? (
                            <PanelRight className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2">
                    <NavItem
                        icon={<Home className="w-5 h-5" />}
                        label="Home"
                        sidebarOpen={sidebarOpen}
                        active={activePage === "home"}
                        onClick={() => setActivePage("home")}
                    />
                    <NavItem
                        icon={<Calendar className="w-5 h-5" />}
                        label="My Bookings"
                        sidebarOpen={sidebarOpen}
                        active={activePage === "bookings"}
                        onClick={() => setActivePage("bookings")}
                    />
                    <NavItem
                        icon={<Crown className="w-5 h-5" />}
                        label="Membership"
                        sidebarOpen={sidebarOpen}
                        active={activePage === "membership"}
                        onClick={() => setActivePage("membership")}
                    />
                    <NavItem
                        icon={<Bell className="w-5 h-5" />}
                        label="Notifications"
                        sidebarOpen={sidebarOpen}
                        active={activePage === "notifications"}
                        onClick={() => setActivePage("notifications")}
                    />
                    <NavItem
                        icon={<User className="w-5 h-5" />}
                        label="Profile"
                        sidebarOpen={sidebarOpen}
                        active={activePage === "profile"}
                        onClick={() => setActivePage("profile")}
                    />
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {getPageTitle(activePage)}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-semibold text-gray-800">
                                {user?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                                {user?.email}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-8">
                    {activePage === "home" && <HomePage user={user} />}
                    {activePage === "bookings" && <BookingsPage />}
                    {activePage === "membership" && <MembershipPage />}
                    {activePage === "notifications" && <NotificationsPage />}
                    {activePage === "profile" && <ProfilePage user={user} />}
                </div>
            </div>
        </div>
    );
}

// Navigation Item Component
interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    sidebarOpen: boolean;
    active: boolean;
    onClick: () => void;
}

function NavItem({
    icon,
    label,
    sidebarOpen,
    active,
    onClick,
}: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${active
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
        >
            {icon}
            {sidebarOpen && <span>{label}</span>}
        </button>
    );
}

// Get Page Title
function getPageTitle(page: string): string {
    const titles: { [key: string]: string } = {
        home: "Dashboard",
        bookings: "My Bookings",
        membership: "Membership",
        facilities: "Facilities",
        notifications: "Notifications",
        profile: "My Profile",
    };
    return titles[page] || "Dashboard";
}

// Home Page Component
interface HomePageProps {
    user: any;
}

function HomePage({ user }: HomePageProps) {
    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 shadow-lg">
                <h1 className="text-4xl font-bold mb-2">
                    Welcome, {user?.name}! 🎾
                </h1>
                <p className="text-blue-100">
                    Ready to book your next pickleball session?
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Bookings"
                    value="8"
                    icon="📅"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Hours Played"
                    value="24"
                    icon="⏱️"
                    color="bg-green-500"
                />
                <StatCard
                    title="Favorite Facility"
                    value="Court A"
                    icon="🏢"
                    color="bg-purple-500"
                />
                <StatCard
                    title="Upcoming"
                    value="2"
                    icon="📍"
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Recent Bookings
                </h3>
                <div className="space-y-4">
                    <BookingItem
                        facility="Downtown Sports Complex"
                        date="Dec 20, 2024"
                        time="6:00 PM - 7:00 PM"
                        status="Confirmed"
                    />
                    <BookingItem
                        facility="Riverside Courts"
                        date="Dec 22, 2024"
                        time="7:00 PM - 8:00 PM"
                        status="Pending"
                    />
                    <BookingItem
                        facility="Valley Park"
                        date="Dec 25, 2024"
                        time="10:00 AM - 11:00 AM"
                        status="Confirmed"
                    />
                </div>
            </div>
        </div>
    );
}

// Bookings Page Component
function BookingsPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    onClick={() => router.push("/booking/area")}
                >
                    + New Booking
                </button>
                <button className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">
                    Filter
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Facility
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Time
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <BookingRow
                            facility="Downtown Sports Complex"
                            date="Dec 20, 2024"
                            time="6:00 PM - 7:00 PM"
                            price="₱500"
                            status="Confirmed"
                        />
                        <BookingRow
                            facility="Riverside Courts"
                            date="Dec 22, 2024"
                            time="7:00 PM - 8:00 PM"
                            price="₱450"
                            status="Pending"
                        />
                        <BookingRow
                            facility="Valley Park"
                            date="Dec 25, 2024"
                            time="10:00 AM - 11:00 AM"
                            price="₱500"
                            status="Confirmed"
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Membership Page Component
function MembershipPage() {
    const [currentPlan] = useState("free"); // mock current plan
    const [selected, setSelected] = useState<string | null>(null);

    const plans = [
        {
            id: "free",
            name: "Free",
            price: "₱0",
            period: "forever",
            features: [
                "Up to 2 bookings per month",
                "Standard court access",
                "Email support",
            ],
        },
        {
            id: "pro",
            name: "Pro",
            price: "₱299",
            period: "per month",
            popular: true,
            features: [
                "Unlimited bookings",
                "Priority court access",
                "10% discount on all bookings",
                "2 guest passes per month",
                "Priority support",
            ],
        },
        {
            id: "elite",
            name: "Elite",
            price: "₱599",
            period: "per month",
            features: [
                "Unlimited bookings",
                "VIP court access & reservations",
                "20% discount on all bookings",
                "5 guest passes per month",
                "Dedicated account manager",
                "Early access to new facilities",
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Membership Plans</h1>
                <p className="text-blue-100">
                    Upgrade your plan to unlock priority bookings, discounts, and more.
                </p>
            </div>

            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
                <Crown className="w-5 h-5 text-blue-600" />
                <p className="text-gray-700 text-sm">
                    Your current plan:{" "}
                    <span className="font-semibold text-blue-600 capitalize">
                        {currentPlan}
                    </span>
                </p>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isActive = currentPlan === plan.id;
                    const isSelected = selected === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-lg shadow p-6 border-2 transition-all ${isSelected
                                ? "border-blue-600"
                                : isActive
                                    ? "border-gray-300"
                                    : "border-transparent"
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="mb-3">
                                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                                {plan.name}
                            </h3>
                            <div className="mb-4">
                                <span className="text-3xl font-bold text-gray-900">
                                    {plan.price}
                                </span>
                                <span className="text-gray-500 text-sm ml-1">
                                    /{plan.period}
                                </span>
                            </div>

                            <ul className="space-y-2 mb-6">
                                {plan.features.map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-start gap-2 text-sm text-gray-700"
                                    >
                                        <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {isActive ? (
                                <button
                                    disabled
                                    className="w-full py-2 rounded-lg bg-gray-100 text-gray-400 font-semibold text-sm cursor-not-allowed"
                                >
                                    Current Plan
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        setSelected(isSelected ? null : plan.id)
                                    }
                                    className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${isSelected
                                        ? "bg-blue-600 text-white"
                                        : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                                        }`}
                                >
                                    {isSelected ? "Selected ✓" : `Choose ${plan.name}`}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Confirm Upgrade */}
            {selected && selected !== currentPlan && (
                <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-200">
                    <div>
                        <p className="font-semibold text-gray-800">
                            Ready to upgrade to{" "}
                            <span className="text-blue-600 capitalize">
                                {selected}
                            </span>
                            ?
                        </p>
                        <p className="text-sm text-gray-500">
                            You'll be billed immediately. Cancel anytime.
                        </p>
                    </div>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap">
                        Confirm Upgrade
                    </button>
                </div>
            )}
        </div>
    );
}

// Notifications Page Component
function NotificationsPage() {
    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <h4 className="font-semibold text-blue-900">
                    Booking Confirmed
                </h4>
                <p className="text-blue-700 text-sm">
                    Your booking for Dec 20 at 6:00 PM is confirmed
                </p>
                <p className="text-blue-600 text-xs mt-2">2 hours ago</p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                <h4 className="font-semibold text-yellow-900">
                    Payment Pending
                </h4>
                <p className="text-yellow-700 text-sm">
                    Complete your payment for booking #12345
                </p>
                <p className="text-yellow-600 text-xs mt-2">5 hours ago</p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <h4 className="font-semibold text-green-900">
                    New Facility Available
                </h4>
                <p className="text-green-700 text-sm">
                    Check out our new courts at Valley Park
                </p>
                <p className="text-green-600 text-xs mt-2">1 day ago</p>
            </div>
        </div>
    );
}

// Profile Page Component
interface ProfilePageProps {
    user: any;
}

function ProfilePage({ user }: ProfilePageProps) {
    return (
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
            <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {user?.name}
                    </h2>
                    <p className="text-gray-600">{user?.email}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={user?.name}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={user?.email}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
                    Save Changes
                </button>
            </div>
        </div>
    );
}

// Helper Components
interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <div className={`${color} text-white rounded-lg p-6 shadow`}>
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-sm opacity-90">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

interface BookingItemProps {
    facility: string;
    date: string;
    time: string;
    status: string;
}

function BookingItem({ facility, date, time, status }: BookingItemProps) {
    const statusColor =
        status === "Confirmed"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800";

    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div>
                <p className="font-semibold text-gray-800">{facility}</p>
                <p className="text-sm text-gray-600">
                    {date} • {time}
                </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                {status}
            </span>
        </div>
    );
}

interface BookingRowProps {
    facility: string;
    date: string;
    time: string;
    price: string;
    status: string;
}

function BookingRow({
    facility,
    date,
    time,
    price,
    status,
}: BookingRowProps) {
    const statusColor =
        status === "Confirmed"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800";

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-800">{facility}</td>
            <td className="px-6 py-4 text-sm text-gray-800">{date}</td>
            <td className="px-6 py-4 text-sm text-gray-800">{time}</td>
            <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                {price}
            </td>
            <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-sm">
                <button className="text-blue-600 hover:text-blue-800 font-semibold">
                    View
                </button>
            </td>
        </tr>
    );
}