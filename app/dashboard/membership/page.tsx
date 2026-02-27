// app/dashboard/membership/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AreaCard {
    id: string;
    areaName: string;
    price: number;
    areaImageUrl?: string;
}

export default function MembershipPage() {
    const router = useRouter();
    const [areas, setAreas] = useState<AreaCard[]>([]);
    const [loading, setLoading] = useState(true);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const res = await fetch(`${apiBaseUrl}/api/dashboard/membership-areas/`);

                if (!res.ok) throw new Error("Failed to load areas");

                const data = await res.json();
                setAreas(data.areas || []);
            } catch (err) {
                console.error("Failed to fetch membership areas:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAreas();
    }, [apiBaseUrl]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Coming Soon</h1>
                {/* <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Area</h1>
                <p className="text-gray-600 text-lg">
                    Select to explore membership options
                </p> */}
            </div>
{/* 
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {areas.map((area) => (
                    <div
                        key={area.id}
                        onClick={() => router.push(`/dashboard/membership/${area.id}`)}
                        className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                        <div className="relative h-56 bg-gray-200 overflow-hidden">
                            {area.areaImageUrl ? (
                                <img
                                    src={area.areaImageUrl}
                                    alt={area.areaName}
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <span className="text-white text-7xl">🏓</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{area.areaName}</h3>

                            <div className="flex items-baseline gap-1 mt-4">
                                <span className="text-4xl font-bold text-blue-600">₱{area.price}</span>
                                <span className="text-gray-500 text-lg">/month</span>
                            </div>

                            <p className="text-sm text-gray-500 mt-1">Starting from</p>

                            <button className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                                View Plans
                            </button>
                        </div>
                    </div>
                ))}
            </div> */}
        </div>
    );
}