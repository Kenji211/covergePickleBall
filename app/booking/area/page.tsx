"use client";

import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import MapPage from './components/MapPage';
import { X, CornerUpRight, Search, Loader2, LandPlot, Clock, MapPin, Phone, PhilippinePeso } from "lucide-react";
import { useRouter } from "next/navigation";

type Area = {
    id: string;
    areaName: string;
    address: string;
    lat: number;
    lng: number;
    openingTime: string;
    closingTime: string;
    areaImageUrl?: string | null;
    details: {
        courtCount: number,
        minRate: number,
        maxRate: number
        courtImages: string[];
    };
    managerGcashNumber: string;
};

export default function BookingAreaPage() {
    const router = useRouter();

    //user
    const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);

    //area selection
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);
    const [showRoute, setShowRoute] = useState(false);

    //searchbar things
    const [searchQuery, setSearchQuery] = useState("");
    const [displayValue, setDisplayValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [panelOpen, setPanelOpen] = useState(true);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);


    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const filteredAreas = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return areas.filter((area) => area.areaName.toLowerCase().includes(query));
    }, [searchQuery, areas]);

    useEffect(() => {
        const fetchAreas = async () => {
            if (!apiBaseUrl) {
                console.error("API base URL not configured");
                return;
            }

            try {
                const res = await fetch(`${apiBaseUrl}/api/areas/fetch/`);
                if (!res.ok) throw new Error("Failed to fetch areas");

                const data = await res.json();
                console.log("Fetched areas:", data);
                setAreas(data);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        fetchAreas();
    }, [apiBaseUrl]);

    const handleSelectArea = (area: Area) => {
        setDisplayValue(area.areaName);
        setSearchQuery(area.areaName);
        setShowSuggestions(false);
        setSelectedArea(area);
    };

    const handleSearchChange = useCallback((value: string) => {
        setDisplayValue(value);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            setSearchQuery(value);
            setShowSuggestions(true);
        }, 200);
    }, []);

    const handleClosePanel = () => {
        setShowRoute(false);
        setDisplayValue("");
        setSearchQuery("");
        setSelectedArea(null);
        setPanelOpen(false);
    };

    const handleGetDirections = () => {
        if (!selectedArea) return;

        if (showRoute) {
            setShowRoute(false);
        } else {
            setLoading(true);

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const location = {
                        lng: pos.coords.longitude,
                        lat: pos.coords.latitude,
                    };
                    setUserLocation(location);
                    setShowRoute(true);
                    setLoading(false);
                });
            }
        }
    };

    const handleMakeReservation = () => {
        router.push(`/booking/create?areaId=${selectedArea?.id}`);
    }

    return (
        <div className="relative">
            <MapPage
                areas={areas}
                selectedArea={selectedArea}
                showRoute={showRoute}
                userLocation={userLocation}
                onSelectArea={handleSelectArea}
            />

            {/* Searchbar overlay */}
            <div className="absolute top-3 left-4 right-4 z-30 md:w-94">
                <div className="relative">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Pickleball Courts"
                            value={displayValue}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className={`w-full px-6 py-3 pr-12 bg-white text-gray-800 placeholder-gray-500 shadow-lg focus:outline-none ${showSuggestions && filteredAreas.length > 0
                                ? "rounded-t-[1rem] border-b-1"
                                : "rounded-[2rem]"
                                }`}
                        />

                        {/* Suggestions dropdown */}
                        {showSuggestions && filteredAreas.length > 0 && (
                            <div className="absolute top-full left-0 py-2 right-0 bg-white shadow-lg z-50 max-h-64 overflow-y-auto rounded-b-[1rem]">
                                {filteredAreas.map((area, index) => (
                                    <div
                                        key={area.id}
                                        onClick={() => handleSelectArea(area)}
                                        className={`px-6 py-3 hover:bg-gray-200 cursor-pointer border-b last:border-b-0 flex items-center gap-3 ${index === filteredAreas.length - 1}`}
                                    >
                                        <p className="text-sm text-gray-800 truncate">{area.areaName}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* searchbar icons */}
                    {searchQuery && selectedArea ? (
                        <button
                            onClick={handleClosePanel}
                            disabled={loading}
                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ) : loading ? (
                        <Loader2 className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                    ) : (
                        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    )}
                </div>
            </div>

            {/* desktop Side Panel */}
            {selectedArea && (
                <div className="absolute top-0 left-0 bg-white shadow-lg flex flex-col overflow-hidden z-20 h-[100dvh] md:w-103 hidden md:flex">
                    {/* Scrollable Content */}
                    <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 z-30 bg-gradient-to-b from-black/30 to-transparent" />
                    <div className="flex-1 overflow-y-auto overflow-x-hiddens">
                        {/* Image Placeholder */}
                        <div className="relative">
                            <div className="w-full h-60 bg-gray-300 flex items-center justify-center">
                                {selectedArea.areaImageUrl ? (
                                    <img
                                        src={selectedArea.areaImageUrl}
                                        alt={selectedArea.areaName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500 text-sm">No area image available</span>
                                )}
                            </div>
                            {/* Directions Button */}
                            <button
                                className="absolute bottom-3 right-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleGetDirections}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 strokeWidth={3} className="w-5 h-5 animate-spin" />
                                ) : showRoute ? (
                                    <X strokeWidth={3} className="w-5 h-5" />
                                ) : (
                                    <CornerUpRight strokeWidth={3} className="w-5 h-5" />
                                )}
                            </button>

                            <button
                                className="absolute bottom-3 left-4 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                onClick={handleMakeReservation}
                                disabled={loading}
                            >
                                <span className="text-sm font-medium">Make a Reservation</span>
                            </button>
                        </div>

                        {/* Area Details */}
                        <div className="space-y-4">
                            <div className="my-4">
                                <h2 className="px-4 mb-2 text-xl font-bold text-gray-800 break-words">{selectedArea.areaName}</h2>

                                <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                    <div className="bg-blue-500 text-white p-2 rounded-full flex-shrink-0">
                                        <MapPin strokeWidth={2} className="w-5 h-5" />
                                    </div>
                                    <span>
                                        <span className="font-semibold">Address:</span> {selectedArea.address}
                                    </span>
                                </div>

                                <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                    <div className="bg-blue-500 text-white p-2 rounded-full">
                                        <Clock strokeWidth={2} className="w-5 h-5" />
                                    </div>
                                    <span><span className="font-semibold">Hours:</span> {selectedArea.openingTime} - {selectedArea.closingTime}</span>
                                </div>

                                <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                    <div className="bg-blue-500 text-white p-2 rounded-full">
                                        <LandPlot strokeWidth={2} className="w-5 h-5" />
                                    </div>
                                    <span><span className="font-semibold">Number of Courts:</span> {selectedArea.details.courtCount}</span>
                                </div>

                                <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                    <div className="bg-blue-500 text-white p-2 rounded-full">
                                        <Phone strokeWidth={2} className="w-5 h-5" />
                                    </div>
                                    <span><span className="font-semibold">Contact Info:</span> {selectedArea.managerGcashNumber}</span>
                                </div>

                                <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                    <div className="bg-blue-500 text-white p-2 rounded-full">
                                        <PhilippinePeso strokeWidth={2} className="w-5 h-5" />
                                    </div>
                                    <span>
                                        <span className="font-semibold">Rate:</span>{" "}
                                        {selectedArea.details.minRate === selectedArea.details.maxRate
                                            ? `₱${selectedArea.details.minRate}`
                                            : `₱${selectedArea.details.minRate} - ₱${selectedArea.details.maxRate}`}
                                    </span>
                                </div>
                            </div>

                            {/* Image Carousel Placeholder */}
                            {selectedArea.details.courtImages && selectedArea.details.courtImages.length > 0 && (
                                <div className="my-4">
                                    <h3 className="px-4 mb-2 font-semibold text-gray-800">Court Photos</h3>
                                    <div className="py-2 flex gap-2 overflow-x-auto px-4">
                                        {selectedArea.details.courtImages.map((imageUrl, index) => (
                                            <div
                                                key={index}
                                                className="w-32 h-32 bg-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={`Court ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedArea && (
                <DraggableBottomSheet
                    selectedArea={selectedArea}
                    onMakeReservation={handleMakeReservation}
                    handleGetDirections={handleGetDirections}
                    loading={loading}
                    showRoute={showRoute}
                />
            )}

        </div>
    );
}

// ─── Draggable Bottom Sheet (with height adjustment) ───
const DraggableBottomSheet = ({
    selectedArea,
    onMakeReservation,
    handleGetDirections,
    loading,
    showRoute
}: {
    selectedArea: Area;
    onMakeReservation: () => void;
    handleGetDirections: () => void;
    loading: boolean;
    showRoute: boolean;
}) => {
    const sheetHeight = useMotionValue(65); // percentage of viewport height

    const handleGrabBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const startY = e.clientY;
        const startHeight = sheetHeight.get();

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const deltaY = startY - moveEvent.clientY; // negative = drag down, positive = drag up
            const viewportHeight = window.innerHeight;
            const heightChange = (deltaY / viewportHeight) * 100; // convert to percentage
            let newHeight = startHeight + heightChange;

            // Clamp between 30% and 90%
            newHeight = Math.max(22, Math.min(90, newHeight));

            sheetHeight.set(newHeight);
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    return (
        <motion.div
            className="md:hidden fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-2xl shadow-2xl overflow-hidden"
            style={{
                height: useTransform(sheetHeight, (v) => `${v}dvh`),
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
        >
            <div className="w-full h-full flex flex-col">
                {/* FIXED TOP: Grab handle - draggable */}
                <div
                    className="shrink-0 bg-white px-5 py-3 border-b border-gray-100 cursor-grab active:cursor-grabbing select-none hover:bg-gray-50 touch-none"
                    onPointerDown={handleGrabBarPointerDown}
                >
                    <div className="flex justify-center pointer-events-none">
                        <div className="h-1.5 w-12 rounded-full bg-gray-400" />
                    </div>
                </div>

                {/* SCROLLABLE MIDDLE: content only */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {/* Image */}
                    <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center flex-shrink-0">
                        {selectedArea.areaImageUrl ? (
                            <img
                                src={selectedArea.areaImageUrl}
                                alt={selectedArea.areaName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-500 text-sm">No area image available</span>
                        )}

                        {/* Directions Button */}
                        <button
                            className="absolute bottom-3 right-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleGetDirections}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 strokeWidth={3} className="w-5 h-5 animate-spin" />
                            ) : showRoute ? (
                                <X strokeWidth={3} className="w-5 h-5" />
                            ) : (
                                <CornerUpRight strokeWidth={3} className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div className="my-4">
                            <h2 className="px-4 mb-2 text-xl font-bold text-gray-800 break-words">{selectedArea.areaName}</h2>

                            <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                <div className="bg-blue-500 text-white p-2 rounded-full flex-shrink-0">
                                    <MapPin strokeWidth={2} className="w-5 h-5" />
                                </div>
                                <span>
                                    <span className="font-semibold">Address:</span> {selectedArea.address}
                                </span>
                            </div>

                            <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                <div className="bg-blue-500 text-white p-2 rounded-full">
                                    <Clock strokeWidth={2} className="w-5 h-5" />
                                </div>
                                <span><span className="font-semibold">Hours:</span> {selectedArea.openingTime} - {selectedArea.closingTime}</span>
                            </div>

                            <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                <div className="bg-blue-500 text-white p-2 rounded-full">
                                    <LandPlot strokeWidth={2} className="w-5 h-5" />
                                </div>
                                <span><span className="font-semibold">Number of Courts:</span> {selectedArea.details.courtCount}</span>
                            </div>

                            <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                <div className="bg-blue-500 text-white p-2 rounded-full">
                                    <Phone strokeWidth={2} className="w-5 h-5" />
                                </div>
                                <span><span className="font-semibold">Contact Info:</span> {selectedArea.managerGcashNumber}</span>
                            </div>

                            <div className="px-4 py-2 text-sm text-gray-600 break-words flex items-center gap-4 hover:bg-gray-200">
                                <div className="bg-blue-500 text-white p-2 rounded-full">
                                    <PhilippinePeso strokeWidth={2} className="w-5 h-5" />
                                </div>
                                <span>
                                    <span className="font-semibold">Rate:</span>{" "}
                                    {selectedArea.details.minRate === selectedArea.details.maxRate
                                        ? `₱${selectedArea.details.minRate}`
                                        : `₱${selectedArea.details.minRate} - ₱${selectedArea.details.maxRate}`}
                                </span>
                            </div>
                        </div>

                        {/* Image Carousel Placeholder */}
                        {selectedArea.details.courtImages && selectedArea.details.courtImages.length > 0 && (
                            <div className="my-4">
                                <h3 className="px-4 mb-2 font-semibold text-gray-800">Court Photos</h3>
                                <div className="py-2 flex gap-2 overflow-x-auto px-4">
                                    {selectedArea.details.courtImages.map((imageUrl, index) => (
                                        <div
                                            key={index}
                                            className="w-32 h-32 bg-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={`Court ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FIXED BOTTOM: CTA button - always visible */}
                <div className="shrink-0 bg-white border-t">
                    <div className="p-4">
                        <button
                            onClick={onMakeReservation}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            Make a Reservation
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};