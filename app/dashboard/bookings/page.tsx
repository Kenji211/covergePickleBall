// app/dashboard/bookings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Booking {
  id: string;
  areaName?: string;
  courtName?: string;
  slots?: Array<{ date: string; time: string[] }>;
  amount?: number;
  isApproved?: boolean | null;
  createdAt?: string;
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = user.uid;
        const res = await fetch(
          `${apiBaseUrl}/api/dashboard/my-bookings/?userId=${userId}`
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to load bookings: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err: any) {
        console.error("Bookings fetch error:", err);
        setError("Could not load your bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading]);

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Facility</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Court</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  facility={booking.areaName || "Unknown Facility"}
                  court={booking.courtName || "Unknown Court"}
                  date={booking.slots?.[0]?.date || "—"}
                  price={`₱${booking.amount || "?"}`}
                  status={
                    booking.isApproved === true
                      ? "Confirmed"
                      : booking.isApproved === false
                      ? "Rejected"
                      : "Pending"
                  }
                  onDetailsClick={() => openDetails(booking)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-400 hover:text-gray-600 leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-auto flex-1">
              <div>
                <p className="text-sm text-gray-500">Facility</p>
                <p className="font-semibold text-lg">{selectedBooking.areaName || "Unknown Facility"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Court</p>
                <p className="font-medium">{selectedBooking.courtName || "Unknown Court"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3">Reservation Slots</p>
                {selectedBooking.slots?.map((slot, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-100">
                    <p className="font-medium text-gray-800 mb-2">{slot.date}</p>
                    <div className="flex flex-wrap gap-2">
                      {slot.time.map((t, i) => (
                        <span key={i} className="bg-white px-4 py-2 rounded-lg text-sm border border-gray-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₱{selectedBooking.amount || "—"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block px-5 py-2 rounded-full text-sm font-medium ${
                      selectedBooking.isApproved === true
                        ? "bg-green-100 text-green-700"
                        : selectedBooking.isApproved === false
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedBooking.isApproved === true
                      ? "Confirmed"
                      : selectedBooking.isApproved === false
                      ? "Rejected"
                      : "Pending"}
                  </span>
                </div>
              </div>

              {selectedBooking.createdAt && (
                <div>
                  <p className="text-sm text-gray-500">Booked On</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingRow({
  facility,
  court,
  date,
  price,
  status,
  onDetailsClick,
}: {
  facility: string;
  court: string;
  date: string;
  price: string;
  status: string;
  onDetailsClick: () => void;
}) {
  const statusColor =
    status === "Confirmed"
      ? "bg-green-100 text-green-800"
      : status === "Rejected"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <tr className="hover:bg-gray-50 y">
      <td className="px-6 py-4 text-sm text-gray-800">{facility}</td>
      <td className="px-6 py-4 text-sm text-gray-800">{court}</td>
      <td className="px-6 py-4 text-sm text-gray-800">{date}</td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{price}</td>
      <td className="px-6 py-4 text-sm">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <button
          onClick={onDetailsClick}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          Details
        </button>
      </td>
    </tr>
  );
}