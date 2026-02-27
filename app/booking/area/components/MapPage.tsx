'use client';

import { Map, MapControls, useMap, MapMarker, MarkerContent, MarkerTooltip, MarkerPopup, MapRoute } from "@/components/ui/map";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

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
    managerGcashNumber: string; // should be number
};

function MapInitializer() {
    const { map } = useMap();
    const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);

    useEffect(() => {
        if (!map) return;
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const location = {
                        lng: pos.coords.longitude,
                        lat: pos.coords.latitude,
                    };
                    setUserLocation(location);
                    map.setCenter([location.lng, location.lat]);
                    map.zoomTo(14, { duration: 800 });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, [map]);

    return userLocation ? (
        <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
            <MarkerContent>
                <div className="size-4 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
                {/* <div>
                    <span className="absolute text-xs font-semibold text-black whitespace-nowrap">
                        You
                    </span>
                </div> */}
            </MarkerContent>
        </MapMarker>
    ) : null;
}

function FlyToSelectedArea({ selectedArea }: { selectedArea: Area | null }) {
    const { map } = useMap();

    useEffect(() => {
        if (selectedArea && map) {
            map.flyTo({
                center: [selectedArea.lng, selectedArea.lat],
                zoom: 14,
                duration: 800,
            });
        }
    }, [selectedArea, map]);

    return null;
}

function RouteDisplay({
    showRoute, userLocation, selectedArea }: {
        showRoute: boolean; userLocation: { lng: number; lat: number } | null; selectedArea: Area | null;
    }) {
    const { map } = useMap();
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!showRoute || !userLocation || !selectedArea) return;

        const fetchRoute = async () => {
            setLoading(true);
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await fetch(
                    `${apiBaseUrl}/api/booking/directions/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            origin: {
                                lat: userLocation.lat,
                                lng: userLocation.lng,
                            },
                            destination: {
                                lat: selectedArea.lat,
                                lng: selectedArea.lng,
                            },
                        }),
                    }
                );

                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];

                    // Extract coordinates from the polyline
                    const coords: [number, number][] = [];
                    route.legs.forEach((leg: any) => {
                        leg.steps.forEach((step: any) => {
                            const points = decodePolyline(step.polyline.points);
                            coords.push(...points);
                        });
                    });

                    setRouteCoordinates(coords);
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoute();
    }, [showRoute, userLocation, selectedArea]);

    // Helper function to decode polyline
    const decodePolyline = (encoded: string): [number, number][] => {
        const inv = 1.0 / 1e5;
        const decoded: [number, number][] = [];
        let previous = [0, 0];
        let i = 0;

        while (i < encoded.length) {
            let ll = [0, 0];
            for (let j = 0; j < 2; j++) {
                let shift = 0;
                let result = 0;
                let byte = 0;
                do {
                    byte = encoded.charCodeAt(i++) - 63;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                ll[j] = previous[j] + (result & 1 ? ~(result >> 1) : result >> 1);
                previous[j] = ll[j];
            }
            decoded.push([ll[1] * inv, ll[0] * inv]);
        }
        return decoded;
    };

    if (!showRoute || !userLocation || !selectedArea || routeCoordinates.length === 0) return null;

    return (
        <MapRoute
            coordinates={routeCoordinates}
            color="#0033ff"
            width={6}
        />
    );
}

function AreaMarkersWithZoom({ areas, onSelectArea }: { areas: Area[]; onSelectArea: (area: Area) => void }) {
    const { map } = useMap();
    const [zoomLevel, setZoomLevel] = useState(14);

    useEffect(() => {
        if (!map) return;

        const handleZoom = () => {
            setZoomLevel(map.getZoom());
        };

        map.on('zoom', handleZoom);

        return () => {
            map.off('zoom', handleZoom);
        };
    }, [map]);

    return (
        <>
            {areas.map((area) => (
                <MapMarker
                    key={area.id}
                    longitude={area.lng}
                    latitude={area.lat}
                >
                    <MarkerContent>
                        <HoverCard openDelay={10} closeDelay={200}>
                            <HoverCardTrigger asChild>
                                <button onClick={() => onSelectArea(area)} className="cursor-pointer">
                                    <MapPin
                                        className="fill-red-600 stroke-white"
                                        size={36}
                                    />
                                    {zoomLevel >= 13 && ( // Show area name only at zoom level 14 or higher
                                        <span className="absolute left-4 top-4 ml-4 -translate-y-1/2 text-xs font-semibold text-black whitespace-nowrap">
                                            {area.areaName}
                                        </span>
                                    )}
                                </button>
                            </HoverCardTrigger>
                            <HoverCardContent side="top" className="w-48 p-0">
                                <div className="flex flex-col rounded-md overflow-hidden">
                                    {area.areaImageUrl && (
                                        <img
                                            src={area.areaImageUrl}
                                            className="w-full h-24 object-cover"
                                        />
                                    )}
                                    <div className="p-2">
                                        <p className="text-sm font-medium text-gray-800">{`Hours: ${area.openingTime} - ${area.closingTime}`}</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {`Rate: ${area.details.minRate === area.details.maxRate
                                                ? `₱${area.details.minRate}`
                                                : `₱${area.details.minRate} - ₱${area.details.maxRate}`}`}
                                        </p>
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </MarkerContent>
                </MapMarker>
            ))}
        </>
    );
}

export default function MapPage({
    areas, selectedArea, showRoute, userLocation, onSelectArea }: {
        areas: Area[]; selectedArea: Area | null; showRoute: boolean; userLocation: { lng: number; lat: number } | null;
        onSelectArea: (area: Area) => void;
    }) {
    return (
        <div className="w-full h-[100dvh] bg-white">
            <Map
                zoom={6}
                theme="light"
                center={[121.7740, 12.8797]}
            >
                <MapInitializer />
                <FlyToSelectedArea selectedArea={selectedArea} />
                <RouteDisplay showRoute={showRoute} userLocation={userLocation} selectedArea={selectedArea} />

                {/* Area markers */}
                <AreaMarkersWithZoom areas={areas} onSelectArea={onSelectArea} />

                <MapControls
                    position="bottom-right"
                    showZoom
                    showLocate
                />
            </Map>
        </div>
    );
}