"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
    const router = useRouter();
    const [scrollY, setScrollY] = useState(0);
    const [windowSize, setWindowSize] = useState({ width: 1000, height: 600 });
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingLoading, setIsBookingLoading] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);
        handleResize(); // Set initial size

        // 1500ms timeout for page to fully load
        const timer = setTimeout(() => setIsLoading(false), 2500);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
            clearTimeout(timer);
        };
    }, []);

    let minHeight = 400;
    let overlayTextSize = "text-[42px]";
    let overlayHeadingSize = "text-5xl";
    let buttonSize = "mb-4 px-8 py-3";
    let mainHeadingSize = "text-[126px]";
    let textOnblackBg = "text-[56px]";
    let darkBgEffect = "bg-gradient-to-t from-black/80 to-gray-400/30";

    // Mobile (< 640px)
    if (windowSize.width < 640) {
        minHeight = 700;
        overlayTextSize = "mb-42 text-[38px]";
        overlayHeadingSize = "mb-12 text-[36px]";
        buttonSize = "text-[16px] mb-18 px-7 py-2.5";
        mainHeadingSize = "mt-8 text-[64px]";
        textOnblackBg = "text-[28px]"
    }
    // Tablet (640px - 1024px)
    else if (windowSize.width < 1024) {
        minHeight = 1000;
        overlayTextSize = "mb-48 text-[52px]";
        overlayHeadingSize = "mb-12 text-[60px]";
        buttonSize = "text-[26px] mb-18 px-14 py-5";
        mainHeadingSize = "mt-14 text-[140px]";
        textOnblackBg = "text-[48px]"
    }
    // Desktop (>= 1024px)
    else {
        minHeight = 700;
        overlayTextSize = "mb-32 text-[72px]";
        overlayHeadingSize = "text-[64px]";
        buttonSize = "text-[28px] mb-10 px-8 py-3";
        mainHeadingSize = "mt-8 text-[120px]";
        textOnblackBg = "text-[56px]"
    }

    const resizeStart = 0;
    const effectiveScroll = Math.max(0, scrollY - resizeStart);

    const handleBookingClick = () => {
        setIsBookingLoading(true);
        // Check if user is authenticated
        const token = localStorage.getItem("firebaseToken");
        if (!token) {
            router.push("/auth");
            return;
        } else
            router.push("/booking/area");
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <section className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {/* Text skeleton - Full screen height */}
                <div className="w-full h-screen flex flex-col justify-center items-center text-center px-4">
                    <Skeleton className="h-24 w-full mb-6 rounded-xl" />
                    <Skeleton className="h-20 w-4/5 mb-4 rounded-xl" />
                    <Skeleton className="h-16 w-3/5 rounded-xl" />
                </div>

                {/* Image skeleton */}
                <div className="flex justify-center px-4 mb-20">
                    <Skeleton
                        style={{ height: minHeight }}
                        className="w-full rounded-lg shadow-2xl"
                    />
                </div>

                {/* Black section skeleton */}
                <div className="py-20 px-12 w-full bg-black">
                    <Skeleton className="h-24 w-3/4 rounded-lg bg-gray-600" />
                    <Skeleton className="h-20 w-2/3 mt-4 rounded-lg bg-gray-600" />
                </div>

                {/* Content skeleton */}
                <div className="container mx-auto px-4 my-20">
                    <Skeleton className="h-10 w-2/5 mx-auto mb-12 rounded-xl" />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-full rounded-lg" />
                            <Skeleton className="h-4 w-4/5 rounded-lg" />
                            <Skeleton className="h-4 w-3/5 rounded-lg" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-full rounded-lg" />
                            <Skeleton className="h-4 w-4/5 rounded-lg" />
                            <Skeleton className="h-4 w-3/5 rounded-lg" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-full rounded-lg" />
                            <Skeleton className="h-4 w-4/5 rounded-lg" />
                            <Skeleton className="h-4 w-3/5 rounded-lg" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-full rounded-lg" />
                            <Skeleton className="h-4 w-4/5 rounded-lg" />
                            <Skeleton className="h-4 w-3/5 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* CTA skeleton */}
                <div className="container mx-auto px-4 mb-20">
                    <Skeleton className="h-14 w-1/2 mx-auto mb-12 rounded-xl" />
                    <Skeleton className="w-full h-64 rounded-2xl shadow-lg" />
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Text Container */}
            <div className="w-full flex flex-col justify-center items-center text-center px-4">
                <h1 className={` ${mainHeadingSize} font-extrabold text-black leading-tight z-30 relative -mb-8 md:-mb-16`}>
                    Serve, Smash,<br />Score.
                </h1>
            </div>

            {/* Background image */}
            <div
                className=" overflow-hidden shadow-2xl relative"
                style={{ height: minHeight }}
            >
                <img
                    src="/courts/pickleball1.jpg"
                    alt="Pickleball Court"
                    className="w-full h-full object-cover"
                />
                {/* Text and Button Overlay */}
                <div className={`absolute inset-0 flex flex-col justify-end items-center pb-8 md:pb-12 ${darkBgEffect} t text-center`}>
                    <h1
                        className={`${overlayTextSize} text-gray-200 leading-relaxed transition delay-100 duration-200 ease-in-out px-8`}
                        style={{ opacity: Math.min(1, (effectiveScroll - 40) / 100) }}
                    >
                        Premium courts, seamless bookings, and endless rallies
                    </h1>
                    <button
                        onClick={() => {
                            const element = document.getElementById("learnMore");
                            element?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`bg-white hover:bg-blue-400 text-black font-semibold ${buttonSize} rounded-lg transition-colors duration-200`}
                    >
                        Learn More
                    </button>
                    <h2 className={`${overlayHeadingSize} font-bold text-white leading-tight px-4`}>
                        Own Every Point
                    </h2>
                </div>
            </div>

            <div className="py-20 px-12 w-full bg-black text-end">
                <h1 className={`text-white ${textOnblackBg}`}>
                    EXPERIENCE PICKLEBALL<br />LIKE NO OTHER
                </h1>
            </div>

            {/* Features */}
            <section id="learnMore">
                <div className="container mx-auto px-4">

                    <div className="mt-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">
                            Your Game, Your Court, Your Community.
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-12">
                            PickleBook is Koronadal's premier multi-venue pickleball reservation platform.
                            Connect with top-rated courts across the city, book your favorite spots in seconds, and
                            join a thriving community of passionate pickleball players. Whether you're a casual player
                            or a competitive enthusiast, find the perfect court and elevate your game today.
                        </p>
                        <div className="h-1 w-24 bg-blue-400 mx-auto mb-8"></div>
                    </div>

                    {/* How It Works */}
                    <div className="">
                        <h3 className="text-[42px] md:text-[60px] text-center font-bold mb-8 text-black">How It Works</h3>
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left side - Steps */}
                            <div className="order-2 lg:order-1">
                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">1</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Find Courts</h4>
                                            <p className="text-slate-600">Browse available courts near you with detailed info and ratings</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">2</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Pick Time</h4>
                                            <p className="text-slate-600">Select your preferred date and time slots easily</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">3</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Book & Pay</h4>
                                            <p className="text-slate-600">Confirm your booking and pay securely via GCash</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">✓</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Play!</h4>
                                            <p className="text-slate-600">Show up and enjoy your pickleball game with friends</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Image */}
                            <div className="lg:block order-1 lg:order-2">
                                <div className="relative rounded-lg overflow-hidden shadow-xl">
                                    <img
                                        src="/courts/pickleball4.jpg"
                                        alt="Players enjoying pickleball"
                                        className="w-full h-72 lg:h-96 object-cover"
                                    />
                                    <div className={`absolute inset-0 ${darkBgEffect}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="w-full flex flex-col justify-center items-center text-center">
                        <h1 className="text-[42px] md:text-[60px] font-extrabold text-black transform translate-y-8 z-30">
                            Book Now
                        </h1>

                        <div className="w-full rounded-lg overflow-hidden mb-20 relative">
                            <img
                                src="/courts/pickleball8.jpg"
                                className="w-full h-full object-cover absolute inset-0"
                            />

                            {/* Dark overlay */}
                            <div className={`absolute inset-0 ${darkBgEffect}`}></div>

                            {/* Content */}
                            <div className="relative z-10 p-16 text-center">
                                <h2 className="text-4xl font-bold text-white mb-4">Ready to Elevate Your Game?</h2>
                                <p className="text-blue-100 mb-6 text-lg">Join hundreds of players booking their favorite courts</p>
                                <button
                                    onClick={handleBookingClick}
                                    disabled={isBookingLoading}
                                    className="bg-white hover:bg-blue-400 text-black font-semibold px-6 py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isBookingLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </span>
                                    ) : (
                                        "Get Started"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
}