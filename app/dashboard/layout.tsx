// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import {
    PanelRight,
    Menu,
    LogOut,
    Home,
    Calendar,
    Crown,
    Bell,
    User,
    X,
} from "lucide-react";
import { AuthProvider } from "@/lib/auth-context";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Auto-open sidebar on desktop, keep closed on mobile
    useEffect(() => {
        if (!isMobile) {
            setSidebarOpen(true);
        }
    }, [isMobile]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const closeSidebar = () => setSidebarOpen(false);

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

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("firebaseToken");
            localStorage.removeItem("userId");
            router.push("/auth");
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
        <AuthProvider>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <div
                    className={`hidden md:flex ${sidebarOpen ? "w-64" : "w-20"
                        } bg-gray-900 text-white flex flex-col overflow-y-auto`}
                >
                    <div className="p-6 flex items-center justify-between">
                        <h1 className={`font-bold text-xl ${!sidebarOpen && "hidden"}`}>
                            PickleBook
                        </h1>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1 hover:bg-gray-800 rounded-lg"
                        >
                            {sidebarOpen ? <PanelRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        <SidebarLink
                            href="/dashboard"
                            icon={<Home className="w-5 h-5" />}
                            label="Home"
                            sidebarOpen={sidebarOpen}
                            isActive={pathname === "/dashboard"}
                        />
                        <SidebarLink
                            href="/dashboard/bookings"
                            icon={<Calendar className="w-5 h-5" />}
                            label="My Bookings"
                            sidebarOpen={sidebarOpen}
                            isActive={pathname.startsWith("/dashboard/bookings")}
                        />
                        <SidebarLink
                            href="/dashboard/membership"
                            icon={<Crown className="w-5 h-5" />}
                            label="Membership"
                            sidebarOpen={sidebarOpen}
                            isActive={pathname === "/dashboard/membership"}
                        />
                        <SidebarLink
                            href="/dashboard/notifications"
                            icon={<Bell className="w-5 h-5" />}
                            label="Notifications"
                            sidebarOpen={sidebarOpen}
                            isActive={pathname === "/dashboard/notifications"}
                        />
                        <SidebarLink
                            href="/dashboard/profile"
                            icon={<User className="w-5 h-5" />}
                            label="Profile"
                            sidebarOpen={sidebarOpen}
                            isActive={pathname === "/dashboard/profile"}
                        />
                    </nav>

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

                {/* Mobile Drawer / Sheet */}
                {isMobile && sidebarOpen && (
                    <>
                        {/* Overlay to close on tap outside */}
                        <div
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                            onClick={closeSidebar}
                        />

                        {/* Drawer from left */}
                        <div
                            className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                                }`}
                        >
                            <div className="p-6 flex items-center justify-between border-b border-gray-800">
                                <h1 className="font-bold text-xl">PickleBook</h1>
                                <button onClick={closeSidebar}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                <SidebarLink
                                    href="/dashboard"
                                    icon={<Home className="w-6 h-6" />}
                                    label="Home"
                                    sidebarOpen={true}
                                    isActive={pathname === "/dashboard"}
                                    onClick={closeSidebar}
                                />
                                <SidebarLink
                                    href="/dashboard/bookings"
                                    icon={<Calendar className="w-6 h-6" />}
                                    label="My Bookings"
                                    sidebarOpen={true}
                                    isActive={pathname.startsWith("/dashboard/bookings")}
                                    onClick={closeSidebar}
                                />
                                <SidebarLink
                                    href="/dashboard/membership"
                                    icon={<Crown className="w-6 h-6" />}
                                    label="Membership"
                                    sidebarOpen={true}
                                    isActive={pathname === "/dashboard/membership"}
                                    onClick={closeSidebar}
                                />
                                <SidebarLink
                                    href="/dashboard/notifications"
                                    icon={<Bell className="w-6 h-6" />}
                                    label="Notifications"
                                    sidebarOpen={true}
                                    isActive={pathname === "/dashboard/notifications"}
                                    onClick={closeSidebar}
                                />
                                <SidebarLink
                                    href="/dashboard/profile"
                                    icon={<User className="w-6 h-6" />}
                                    label="Profile"
                                    sidebarOpen={true}
                                    isActive={pathname === "/dashboard/profile"}
                                    onClick={closeSidebar}
                                />
                            </nav>

                            <div className="p-4 border-t border-gray-800">
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        closeSidebar();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-6 h-6" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                        {isMobile && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
                            >
                                <Menu className="w-6 h-6 text-gray-700" />
                            </button>
                        )}
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                            {getPageTitle(pathname)}
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="font-semibold text-gray-800">{user?.name}</p>
                                <p className="text-sm text-gray-600">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-auto p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}

// Reusable Sidebar Link
function SidebarLink({
    href,
    icon,
    label,
    sidebarOpen,
    isActive,
    onClick,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    sidebarOpen: boolean;
    isActive: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
        >
            {icon}
            {sidebarOpen && <span>{label}</span>}
        </Link>
    );
}

// Dynamic page title based on path
function getPageTitle(pathname: string): string {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/dashboard/bookings")) return "My Bookings";
    if (pathname === "/dashboard/membership") return "Membership";
    if (pathname === "/dashboard/notifications") return "Notifications";
    if (pathname === "/dashboard/profile") return "My Profile";
    return "Dashboard";
}