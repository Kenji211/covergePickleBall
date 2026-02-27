'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel'
import { useSearchParams } from 'next/navigation'
import { ConfirmationDialog } from '@/app/payment/ConfirmationDialog'
import { useAuth } from '@/lib/auth-context'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function CreateBooking() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    const [loading, setLoading] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [dialogStage, setDialogStage] = useState<'confirmation' | 'pending'>('confirmation')
    const [bookingResult, setBookingResult] = useState<any>(null)
    const searchParams = useSearchParams()
    const areaId = searchParams.get('areaId')
    const { user, loading: authLoading } = useAuth()

    // form
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gcashNumber: '',
    })
    const [displayFormData, setDisplayFormData] = useState(formData)
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)

    // dates and times
    const [selectedDates, setSelectedDates] = useState<Date[]>([])
    const [area, setArea] = useState<Area | null>(null)
    const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null)
    const [selectedEquipments, setSelectedEquipments] = useState<Record<string, number>>({}) // equipmentId -> quantity

    // NEW: selected time slots PER DATE
    const [selectedTimeSlotsByDate, setSelectedTimeSlotsByDate] = useState<Record<string, string[]>>({})
    const [activeDateIndex, setActiveDateIndex] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)

    interface Court {
        courtId: string
        courtName: string
        status: string
        rate?: number
        courtImageUrl?: string
    }

    interface Equipment {
        id: string
        name: string
        price: number
        quantity: number // available stock
    }

    interface ManagerInfo {
        firstName: string
        lastName: string
        gcashNumber: string
        qrCode: string
    }

    interface ReservedSlot {
        date: string
        time: string[]
    }

    interface Area {
        id: string
        areaName: string
        openingTime: string
        closingTime: string
        areaImageUrl?: string
        courts: Court[]
        equipments?: Equipment[]
        manager: ManagerInfo
        bookings: ReservedSlot[]
    }

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target

            // Update display instantly
            setDisplayFormData((prev) => ({
                ...prev,
                [name]: value,
            }))

            // Debounce the actual form data
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }

            debounceTimer.current = setTimeout(() => {
                setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                }))
            }, 300)
        },
        []
    )

    const handleEquipmentQuantityChange = (equipmentId: string, quantity: number) => {
        setSelectedEquipments(prev => {
            if (quantity <= 0) {
                const { [equipmentId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [equipmentId]: quantity }
        })
    }

    const formatDateKey = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    const sortedSelectedDates = useMemo(() => {
        const copy = [...selectedDates]
        copy.sort((a, b) => a.getTime() - b.getTime())
        return copy
    }, [selectedDates])

    // Ensure activeDateIndex stays valid when selectedDates changes
    useEffect(() => {
        if (sortedSelectedDates.length === 0) {
            setActiveDateIndex(0)
            return
        }
        if (activeDateIndex >= sortedSelectedDates.length) {
            setActiveDateIndex(sortedSelectedDates.length - 1)
        }
    }, [sortedSelectedDates, activeDateIndex])

    const activeDate = sortedSelectedDates[activeDateIndex] || null
    const activeDateKey = activeDate ? formatDateKey(activeDate) : null

    const generateTimeSlots = () => {
        if (!area) return []

        const times: string[] = []
        const parseTime = (timeStr: string) => {
            const [time, period] = timeStr.split(' ')
            let [hours] = time.split(':').map(Number)
            if (period === 'PM' && hours !== 12) hours += 12
            if (period === 'AM' && hours === 12) hours = 0
            return hours
        }

        const startHour = parseTime(area.openingTime)
        const endHour = parseTime(area.closingTime)

        for (let i = startHour; i < endHour; i++) {
            const hour = i % 24
            const nextHour = (hour + 1) % 24

            const formatHour = (h: number) => {
                const ampm = h >= 12 ? 'PM' : 'AM'
                const displayHour = h % 12 || 12
                return `${String(displayHour).padStart(2, '0')}:00 ${ampm}`
            }

            times.push(`${formatHour(hour)} - ${formatHour(nextHour)}`)
        }

        return times
    }

    const timeSlots = generateTimeSlots()

    // NEW: toggle time slot for ACTIVE DATE only
    const toggleTimeSlotForActiveDate = (time: string) => {
        if (!activeDateKey) return

        setSelectedTimeSlotsByDate((prev) => {
            const current = prev[activeDateKey] || []
            const updated = current.includes(time)
                ? current.filter((t) => t !== time)
                : [...current, time]

            return {
                ...prev,
                [activeDateKey]: updated,
            }
        })
    }

    const getSelectedTimesForActiveDate = () => {
        if (!activeDateKey) return []
        return selectedTimeSlotsByDate[activeDateKey] || []
    }

    // NEW: remove date entry in selectedTimeSlotsByDate if date was unselected
    useEffect(() => {
        const validKeys = new Set(sortedSelectedDates.map(formatDateKey))

        setSelectedTimeSlotsByDate((prev) => {
            const cleaned: Record<string, string[]> = {}
            for (const key of Object.keys(prev)) {
                if (validKeys.has(key)) cleaned[key] = prev[key]
            }
            return cleaned
        })
    }, [sortedSelectedDates])

    // Calculate total amount: (total selected time slots across all dates) * rate
    // useEffect(() => {
    //     if (!area || !selectedCourtId) {
    //         setTotalAmount(0)
    //         return
    //     }

    //     const selectedCourt = area.courts.find(
    //         (court) => court.courtId === selectedCourtId
    //     )
    //     if (!selectedCourt || !selectedCourt.rate) {
    //         setTotalAmount(0)
    //         return
    //     }

    //     const totalHours = Object.values(selectedTimeSlotsByDate).reduce(
    //         (sum, times) => sum + times.length,
    //         0
    //     )

    //     setTotalAmount(totalHours * selectedCourt.rate)
    // }, [area, selectedCourtId, selectedTimeSlotsByDate])

    //calculate total amount whenever selected court, time slots, or equipments change
    useEffect(() => {
        if (!area || !selectedCourtId) {
            setTotalAmount(0)
            return
        }

        const selectedCourt = area.courts.find(c => c.courtId === selectedCourtId)
        const courtCost = (selectedCourt?.rate || 0) * Object.values(selectedTimeSlotsByDate).reduce((sum, times) => sum + times.length, 0)

        // Equipment rental cost
        let equipmentCost = 0
        Object.keys(selectedEquipments).forEach(eqId => {
            const qty = selectedEquipments[eqId]
            const equipment = area.equipments?.find(eq => eq.id === eqId)
            if (equipment) {
                equipmentCost += equipment.price * qty
            }
        })

        setTotalAmount(courtCost + equipmentCost)
    }, [area, selectedCourtId, selectedTimeSlotsByDate, selectedEquipments])

    useEffect(() => {
        if (authLoading || !user) return

        const fetchUserProfile = async () => {
            try {
                const userRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userRef)

                if (userSnap.exists()) {
                    const data = userSnap.data()

                    const fullName = user.displayName || ''
                    const [first = '', last = ''] = fullName.split(' ')

                    setFormData({
                        firstName: data.firstName || first || '',
                        lastName: data.lastName || last || '',
                        email: data.email || user.email || '',
                        gcashNumber: data.phone || '',
                    })

                    // Also update display version
                    setDisplayFormData({
                        firstName: data.firstName || first || '',
                        lastName: data.lastName || last || '',
                        email: data.email || user.email || '',
                        gcashNumber: data.phone || '',
                    })
                } else {
                    // Fallback to Auth data only
                    setFormData({
                        firstName: '',
                        lastName: '',
                        email: user.email || '',
                        gcashNumber: '',
                    })
                    setDisplayFormData({
                        firstName: '',
                        lastName: '',
                        email: user.email || '',
                        gcashNumber: '',
                    })
                }
            } catch (err) {
                console.error('Failed to fetch user profile:', err)
            }
        }

        fetchUserProfile()
    }, [user, authLoading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!area || !selectedCourtId || selectedDates.length === 0) {
            alert('Please select court and dates')
            return
        }

        const missingDates = selectedDates.filter((d) => {
            const key = formatDateKey(d)
            const times = selectedTimeSlotsByDate[key] || []
            return times.length === 0
        })

        if (missingDates.length > 0) {
            const missingText = missingDates
                .map((d) => formatDateKey(d))
                .join(", ")

            alert(`Please select time slots for these date(s): ${missingText}`)
            return
        }

        // Show confirmation dialog
        setDialogStage('confirmation')
        setShowDialog(true)
    }

    const confirmBooking = async () => {
        const slots = sortedSelectedDates
            .map((date) => {
                const dateKey = formatDateKey(date)
                const times = selectedTimeSlotsByDate[dateKey] || []
                return {
                    date: dateKey,
                    time: times,
                }
            })
            .filter((slot) => slot.time.length > 0)

        if (slots.length === 0) {
            alert('Please select at least 1 time slot for at least 1 date')
            return
        }

        const payload = {
            userId: user?.uid,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            gcashNumber: `+63${formData.gcashNumber.trim()}`,
            areaId: area?.id,
            courtId: selectedCourtId,
            slots,
            amount: totalAmount,
            rentedEquipments,
        }

        try {
            setLoading(true)

            const res = await fetch(`${apiBaseUrl}/api/booking/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || 'Failed to submit booking')
            }

            const result = await res.json()

            // Send confirmation email
            const emailPayload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                areaName: area?.areaName,
                courtName: selectedCourt?.courtName,
                reservationId: result.reservationId,
                totalAmount: totalAmount,
                dateTimeSlots: slots,
                managerName: `${area?.manager?.firstName} ${area?.manager?.lastName}`,
                gcashNumber: area?.manager?.gcashNumber,
                qrCode: area?.manager?.qrCode,
            }

            await fetch(`${apiBaseUrl}/api/booking/send-details-to-email/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailPayload),
            })

            // Store result and switch to pending stage
            setBookingResult(result)
            setDialogStage('pending')

        } catch (error: any) {
            console.error('Submit error:', error)
            alert(error.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCloseDialog = () => {
        setSelectedDates([])
        setSelectedTimeSlotsByDate({})
        setSelectedCourtId(null)
        setActiveDateIndex(0)
        setTotalAmount(0)
        setShowDialog(false)
    }

    const selectedCourt = area?.courts.find(
        (court) => court.courtId === selectedCourtId
    )

    const totalHours = Object.values(selectedTimeSlotsByDate).reduce(
        (sum, times) => sum + times.length,
        0
    )

    const dateTimeSlots = sortedSelectedDates.map((date) => ({
        date: formatDateKey(date),
        times: selectedTimeSlotsByDate[formatDateKey(date)] || [],
    }))

    // Compute rented equipments in component scope so it can be used in JSX
    const rentedEquipments = useMemo((): { equipmentId: string; name: string; quantity: number; price: number }[] => {
        if (!area) return []

        return Object.keys(selectedEquipments)
            .map((eqId) => {
                const equipment = area.equipments?.find((eq) => eq.id === eqId)
                if (!equipment) return null

                return {
                    equipmentId: eqId,
                    name: equipment.name,
                    quantity: selectedEquipments[eqId],
                    price: equipment.price,
                }
            })
            .filter((e): e is { equipmentId: string; name: string; quantity: number; price: number } => e !== null)
    }, [area, selectedEquipments])

    useEffect(() => {
        const fetchAreaDetails = async () => {
            try {
                const res = await fetch(`${apiBaseUrl}/api/booking/areas/${areaId}/`)
                if (!res.ok) {
                    const errText = await res.text()
                    throw new Error(`Failed to fetch location: ${res.status} - ${errText}`)
                }

                const data: Area = await res.json()

                if (!data.areaName) throw new Error('Invalid location data received')
                if (!data.courts) throw new Error('Invalid courts data received')

                setArea(data)
            } catch (err: any) {
                console.error('Fetch error:', err)
            }
        }

        if (areaId) fetchAreaDetails()
    }, [apiBaseUrl, areaId])

    const selectedTimesActive = getSelectedTimesForActiveDate()

    const goPrevDate = () => {
        if (sortedSelectedDates.length === 0) return
        setActiveDateIndex((prev) => Math.max(0, prev - 1))
    }

    const goNextDate = () => {
        if (sortedSelectedDates.length === 0) return
        setActiveDateIndex((prev) =>
            Math.min(sortedSelectedDates.length - 1, prev + 1)
        )
    }

    const goTodayDate = () => {
        if (sortedSelectedDates.length === 0) return
        const todayKey = formatDateKey(new Date())
        const idx = sortedSelectedDates.findIndex(
            (d) => formatDateKey(d) === todayKey
        )
        if (idx !== -1) setActiveDateIndex(idx)
    }

    const getCurrentDateTime = () => {
        return new Date(); // current local time
    };

    const parseTimeToDate = (timeStr: string, referenceDate: Date = new Date()): Date | null => {
        const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return null;

        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3].toUpperCase();

        // Convert 12-hour to 24-hour
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        const result = new Date(referenceDate);
        result.setHours(hours, minutes, 0, 0);

        return result;
    };

    const isTimeReservedOrPast = (dateKey: string | null, time: string) => {
        if (!dateKey || !area?.bookings) return false;

        const currentDateTime = getCurrentDateTime();
        const todayKey = formatDateKey(currentDateTime);

        // 1. Check if already reserved by others
        const bookingForDate = area.bookings.find((b) => b.date === dateKey);
        if (bookingForDate && bookingForDate.time.includes(time)) {
            return true;
        }

        // 2. For today's date only: disable slots that are past or ongoing
        if (dateKey === todayKey) {
            try {
                const [startStr] = time.split(" - ");
                const startDateTime = parseTimeToDate(startStr.trim(), currentDateTime);

                if (!startDateTime) {
                    console.warn("Invalid time format:", startStr);
                    return false;
                }

                // If slot start is before or at current time → disable
                if (startDateTime <= currentDateTime) {
                    return true;
                }
            } catch (e) {
                console.warn("Failed to parse time:", time, e);
            }
        }

        return false;
    };

    const applyActiveTimesToAllDates = () => {
        if (!activeDateKey) return
        if (selectedTimesActive.length === 0) return
        if (sortedSelectedDates.length === 0) return

        setSelectedTimeSlotsByDate((prev) => {
            const updated = { ...prev }

            sortedSelectedDates.forEach((date) => {
                const dateKey = formatDateKey(date) // convert Date -> string key

                const currentTimes = updated[dateKey] ?? []

                // apply only times that are NOT reserved on that date
                const allowedTimes = selectedTimesActive.filter(
                    (time) => !isTimeReservedOrPast(dateKey, time)
                )

                // merge without duplicates
                updated[dateKey] = Array.from(new Set([...currentTimes, ...allowedTimes]))
            })

            return updated
        })
    }

    return (
        <div className="min-h-screen py-10 px-4">
            <div className="md:mx-26 bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">
                    Pickleball Reservation Form
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Image */}
                        <div className="w-full md:w-2/5 flex-shrink-0">
                            <div className="w-full h-40 md:h-80 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                                {area?.areaImageUrl ? (
                                    <img
                                        src={area.areaImageUrl}
                                        alt={area.areaName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500">No Image</span>
                                )}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="w-full md:flex-1 md:mx-10 md:my-4 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Name
                                </label>
                                <div className="flex gap-4">
                                    <Input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={displayFormData.firstName}
                                        onChange={handleInputChange}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <Input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={displayFormData.lastName}
                                        onChange={handleInputChange}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    value={displayFormData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="flex">
                                    {/* Fixed Prefix */}
                                    <div className="bg-gray-100 border border-r-0 border-gray-300 rounded-lg mr-2 px-2 text-gray-600 font-medium flex items-center">
                                        +63
                                    </div>

                                    {/* Input for digits only */}
                                    <Input
                                        type="tel"
                                        name="gcashNumber"
                                        placeholder="9123456789"
                                        value={displayFormData.gcashNumber}
                                        onChange={(e) => {
                                            // Allow only numbers, max 10 digits
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);

                                            handleInputChange({
                                                target: {
                                                    name: "gcashNumber",
                                                    value
                                                }
                                            } as React.ChangeEvent<HTMLInputElement>);
                                        }}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Court Selection */}
                    <div className="">
                        <div className="w-full md:flex-1 rounded-lg border p-4">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">
                                Select Court
                            </h2>

                            <Carousel opts={{ align: 'center' }} className="w-full">
                                <CarouselContent>
                                    {area?.courts?.map((court) => {
                                        const isSelected = selectedCourtId === court.courtId

                                        return (
                                            <CarouselItem
                                                key={court.courtId}
                                                className="basis-[70%] sm:basis-[45%] lg:basis-[30%]"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCourtId(court.courtId)}
                                                    className={`w-full text-left rounded-lg border p-0.5 transition ${isSelected
                                                        ? 'border-blue-600 bg-blue-600'
                                                        : 'border-gray-300'
                                                        }`}
                                                >
                                                    <div className="rounded-md p-1 transition bg-white">
                                                        <div className="h-[170px] w-full rounded-md bg-gray-200 flex items-center justify-center text-gray-600 text-sm">
                                                            {court.courtImageUrl ? (
                                                                <img
                                                                    src={court.courtImageUrl}
                                                                    className="w-full h-full object-fill rounded-md"
                                                                    alt={court.courtName}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="text-gray-500">No Image</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="mt-3 flex items-center justify-between px-1">
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {court.courtName}
                                                            </p>
                                                            <p className="text-sm font-semibold text-gray-700">
                                                                ₱{court.rate}/hr
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </CarouselItem>
                                        )
                                    })}
                                </CarouselContent>
                            </Carousel>
                        </div>
                    </div>
                    {area?.equipments && area.equipments.length > 0 && (
                        <div className="border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                🏸 Equipment Rental
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {area.equipments.map((eq) => (
                                    <div key={eq.id} className="flex items-center justify-between border rounded-lg p-4">
                                        <div>
                                            <p className="font-medium">{eq.name}</p>
                                            <p className="text-sm text-gray-600">₱{eq.price} each • {eq.quantity} available</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleEquipmentQuantityChange(eq.id, (selectedEquipments[eq.id] || 0) - 1)}
                                                className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-medium">
                                                {selectedEquipments[eq.id] || 0}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleEquipmentQuantityChange(eq.id, (selectedEquipments[eq.id] || 0) + 1)}
                                                disabled={(selectedEquipments[eq.id] || 0) >= eq.quantity}
                                                className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Calendar + Time Slots */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Calendar */}
                        <Calendar
                            required
                            mode="multiple"
                            selected={selectedDates}
                            onSelect={setSelectedDates}
                            disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            className="rounded-lg border w-full md:w-2/5"
                        />

                        {/* Time Slots */}
                        <div className="border rounded-lg p-4 md:w-3/5">
                            {/* Date Controls (Prev / Date today / Next) */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={goPrevDate}
                                    disabled={sortedSelectedDates.length === 0 || activeDateIndex === 0}
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50"
                                >
                                    Prev
                                </button>

                                <button
                                    type="button"
                                    onClick={goTodayDate}
                                    disabled={sortedSelectedDates.length === 0}
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {activeDateKey ? (
                                        <>{activeDateKey}</>
                                    ) : (
                                        <>Select date first</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={goNextDate}
                                    disabled={
                                        sortedSelectedDates.length === 0 ||
                                        activeDateIndex === sortedSelectedDates.length - 1
                                    }
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>

                            {/* Slots Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 max-h-66 gap-2 overflow-y-auto">
                                {timeSlots.map((time) => {
                                    const reserved = isTimeReservedOrPast(activeDateKey, time)

                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            disabled={!activeDateKey || reserved}
                                            onClick={() => toggleTimeSlotForActiveDate(time)}
                                            className={`p-3 rounded-lg border-2 text-sm font-medium transition
                                                            disabled:opacity-50 disabled:cursor-not-allowed 
                                                        ${reserved
                                                    ? "border-gray-200 bg-gray-100 text-gray-400"
                                                    : selectedTimesActive.includes(time)
                                                        ? "border-blue-600 bg-blue-100 text-blue-800"
                                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                                }`}
                                        >
                                            {reserved ? `${time}` : time}
                                        </button>
                                    )
                                })}
                            </div>

                            {activeDateKey && selectedTimesActive.length > 0 && (
                                <div className="mt-4 pt-2 border-t flex items-center justify-between gap-3">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">{selectedTimesActive.length}</span>{" "}
                                        slot(s) selected for {activeDateKey}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={applyActiveTimesToAllDates}
                                        disabled={
                                            !activeDateKey ||
                                            selectedTimesActive.length === 0 ||
                                            sortedSelectedDates.length === 0
                                        }
                                        className="w-auto px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        Apply to all dates
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Amount */}
                    {totalAmount > 0 && (
                        <div className="mt-4 pt-2 border-t">
                            <p className="text-sm text-gray-700 font-semibold">
                                Total Amount: ₱{totalAmount}
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Continue Booking'}
                    </button>
                </form>
            </div>

            <ConfirmationDialog
                isOpen={showDialog}
                onCancel={() => setShowDialog(false)}
                onClose={handleCloseDialog}
                onConfirm={confirmBooking}
                isLoading={loading}
                stage={dialogStage}
                bookingData={{
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    gcashNumber: formData.gcashNumber,
                    areaName: area?.areaName,
                    courtName: selectedCourt?.courtName,
                    courtRate: selectedCourt?.rate,
                    totalHours,
                    totalAmount,
                    selectedDates: selectedDates.length,
                    dateTimeSlots,
                    selectedEquipments: rentedEquipments,
                }}
                managerData={{
                    firstName: area?.manager?.firstName || '',
                    lastName: area?.manager?.lastName || '',
                    gcashNumber: area?.manager?.gcashNumber || '',
                    qrCode: area?.manager?.qrCode,
                }}
                bookingResult={bookingResult}
            />
        </div>
    )
}
