// app/dashboard/membership/[areaId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface MembershipPlan {
    id: string;
    membershipType: string;   // Monthly, Quarterly, Yearly, etc.
    price: number;
    duration: string;         // "1 Month", "3 Months", "12 Months"
    benefits: string[];
    popular?: boolean;
}

export default function MembershipDetailPage() {
    const params = useParams();
    const router = useRouter();
    const areaId = params.areaId as string;

    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [areaName, setAreaName] = useState("");
    const [loading, setLoading] = useState(true);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        if (!areaId) return;

        const fetchPlans = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${apiBaseUrl}/api/dashboard/membership-plans/${areaId}/`);

                if (!res.ok) throw new Error("Failed to load plans");

                const data = await res.json();
                setPlans(data.plans || []);
                setAreaName(data.areaName || "Membership Plans");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [areaId, apiBaseUrl]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <button
                onClick={() => router.back()}
                className="mb-8 flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
                ← Back to Areas
            </button>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">{areaName}</h1>
            <p className="text-gray-600 text-lg mb-10">Choose your membership plan</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-white border-2 rounded-3xl p-8 flex flex-col h-full transition-all hover:shadow-xl ${plan.popular ? "border-blue-600 shadow-xl" : "border-gray-200"
                            }`}
                    >
                        {plan.popular && (
                            <div className="bg-blue-600 text-white text-xs font-bold px-5 py-1.5 rounded-full w-fit mb-6">
                                MOST POPULAR
                            </div>
                        )}

                        <h3 className="text-3xl font-bold mb-1">{plan.membershipType}</h3>

                        <div className="mt-6 mb-8">
                            <span className="text-5xl font-bold">₱{plan.price}</span>
                            <span className="text-gray-500 text-lg"> / {plan.duration}</span>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {plan.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span className="text-gray-700">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <button className="mt-auto w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition">
                            Select This Plan
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}