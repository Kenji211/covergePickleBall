// app/dashboard/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: "success" | "warning" | "info";
  read: boolean;
  bookingId?: string;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = user.uid;
        const res = await fetch(
          `${apiBaseUrl}/api/dashboard/notifications/?userId=${userId}`
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to load notifications: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err: any) {
        console.error("Notifications fetch error:", err);
        setError("Could not load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center py-10">{error}</div>;
  }

  return (
    <div className="space-y-4 px-4 max-w-2xl mx-auto">
      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">
            When you have activity, you'll see it here
          </p>
        </div>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-5 rounded-2xl border-l-4 flex gap-4 shadow-sm transition-all hover:shadow-md ${
              notif.type === "success"
                ? "bg-green-50 border-green-600"
                : notif.type === "warning"
                ? "bg-yellow-50 border-yellow-600"
                : "bg-blue-50 border-blue-600"
            }`}
          >
            {/* Icon */}
            <div className="mt-1 flex-shrink-0">
              {notif.type === "success" && <CheckCircle className="w-6 h-6 text-green-600" />}
              {notif.type === "warning" && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
              {notif.type === "info" && <Clock className="w-6 h-6 text-blue-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900">{notif.title}</h4>
              <p className="text-gray-700 text-sm mt-1 leading-relaxed break-words">
                {notif.message}
              </p>
              <p className="text-xs text-gray-500 mt-3">{notif.timeAgo}</p>
            </div>

            {/* Unread indicator */}
            {!notif.read && (
              <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            )}
          </div>
        ))
      )}
    </div>
  );
}