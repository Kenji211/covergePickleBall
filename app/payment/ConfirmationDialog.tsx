'use client'

import React, { useEffect, useState } from 'react'
import { Clock, Copy, CheckCircle } from 'lucide-react'

interface ConfirmationDialogProps {
    isOpen: boolean
    onCancel: () => void
    onClose: () => void
    isLoading: boolean
    bookingData: {
        firstName: string
        lastName: string
        email: string
        gcashNumber: string
        areaName?: string
        courtName?: string
        courtRate?: number
        totalHours: number
        totalAmount: number
        selectedDates: number
        dateTimeSlots: {
            date: string
            times: string[]
        }[]
        selectedEquipments?: Array<{
            name: string
            quantity: number
            price: number
        }>
    }
    managerData?: {
        firstName: string
        lastName: string
        gcashNumber: string
        qrCode?: string
    }
    bookingResult?: {
        id?: string
        bookingId?: string
    }
    onConfirm: () => void
    stage: 'confirmation' | 'pending'
}

export function ConfirmationDialog({
    isOpen,
    onCancel,
    onClose,
    isLoading,
    bookingData,
    managerData,
    bookingResult,
    onConfirm,
    stage,
}: ConfirmationDialogProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        if (managerData?.gcashNumber) {
            navigator.clipboard.writeText(managerData.gcashNumber)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (!isOpen) return null

    const bookingId = bookingResult?.id || bookingResult?.bookingId

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                {stage === 'confirmation' ? (
                    <>
                        {/* CONFIRMATION STAGE */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Your Booking</h2>

                        {/* Customer Details */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Details</h3>
                            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Name:</span>
                                    <span>{bookingData.firstName} {bookingData.lastName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Email:</span>
                                    <span>{bookingData.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">GCash:</span>
                                    <span>{bookingData.gcashNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Details</h3>
                            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Facility:</span>
                                    <span>{bookingData.areaName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Court:</span>
                                    <span>{bookingData.courtName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Rate:</span>
                                    <span>₱{bookingData.courtRate}/hr</span>
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Details */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected Dates & Times</h3>
                            <div className="space-y-3">
                                {bookingData.dateTimeSlots.map((slot, index) => (
                                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="font-semibold text-blue-900 mb-2">{slot.date}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {slot.times.map((time, timeIndex) => (
                                                <span
                                                    key={timeIndex}
                                                    className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full"
                                                >
                                                    {time}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-blue-700 mt-2">
                                            {slot.times.length} hour(s) × ₱{bookingData.courtRate} = ₱{slot.times.length * (bookingData.courtRate || 0)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ==================== NEW: RENTED EQUIPMENTS ==================== */}
                        {bookingData.selectedEquipments && bookingData.selectedEquipments.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Rented Equipments</h3>
                                <div className="space-y-3">
                                    {bookingData.selectedEquipments.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-800">
                                                ₱{item.price * item.quantity}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Total Amount */}
                        <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Hours: {bookingData.totalHours}h</p>
                                    <p className="text-white font-bold text-lg">Total Amount</p>
                                </div>
                                <p className="text-white font-bold text-3xl">₱{bookingData.totalAmount}</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* PENDING PAYMENT STAGE */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="bg-yellow-100 rounded-full p-4">
                                    <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed - Pending Payment</h2>
                            <p className="text-gray-600">Your dates are now reserved. Complete payment to finalize your booking.</p>
                        </div>

                        {/* Reserved Dates Summary */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3">Reserved Dates & Times</h3>
                            <div className="space-y-3">
                                {bookingData.dateTimeSlots.map((slot, index) => (
                                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-green-900">{slot.date}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {slot.times.map((time, timeIndex) => (
                                                        <span
                                                            key={timeIndex}
                                                            className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full"
                                                        >
                                                            {time}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {bookingData.selectedEquipments && bookingData.selectedEquipments.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Rented Equipments</h3>
                                <div className="space-y-3">
                                    {bookingData.selectedEquipments.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-800">
                                                ₱{item.price * item.quantity}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Booking Summary */}
                        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-gray-800 mb-3">Booking Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Facility:</span>
                                    <span className="font-semibold">{bookingData.areaName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Court:</span>
                                    <span className="font-semibold">{bookingData.courtName}</span>
                                </div>
                                {bookingId && (
                                    <div className="flex justify-between pt-2 border-t border-blue-200">
                                        <span className="text-gray-600">Booking ID:</span>
                                        <span className="font-mono font-semibold text-blue-600">{bookingId}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Amount */}
                        <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-lg text-center">
                            <p className="text-orange-100 text-sm mb-2">Amount to Pay</p>
                            <p className="text-white font-bold text-5xl">₱{bookingData.totalAmount}</p>
                        </div>

                        {/* Manager Details */}
                        {managerData && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Send Payment To Manager</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Court Manager:</p>
                                    <p className="font-semibold text-lg text-gray-800 mb-6">
                                        {managerData.firstName} {managerData.lastName}
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* GCash QR Code */}
                                        {managerData.qrCode ? (
                                            <div className="flex flex-col items-center">
                                                <p className="text-sm text-gray-600 mb-3 font-semibold">Option 1: Scan QR Code</p>
                                                <div className="bg-white p-2 rounded-lg border-2 border-gray-300">
                                                    <img
                                                        src={managerData.qrCode}
                                                        alt="GCash QR Code"
                                                        className="w-48 h-48 rounded"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-sm text-gray-600 mb-3 font-semibold">Option 1: QR Code</p>
                                                <div className="bg-gray-100 p-2 rounded-lg border-2 border-dashed border-gray-300 w-52 h-52 flex items-center justify-center">
                                                    <p className="text-center text-gray-500 text-sm">No QR code set by owner</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* GCash Number */}
                                        <div className="flex flex-col justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-3 font-semibold">Option 2: Send to Number</p>
                                                <div className="bg-white p-4 rounded-lg border-2 border-gray-300 mb-3">
                                                    <p className="text-xs text-gray-600 mb-1">GCash Number</p>
                                                    <p className="font-mono font-bold text-xl text-gray-800">
                                                        {managerData.gcashNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={copyToClipboard}
                                                className={`w-full px-4 py-2 rounded-lg transition-all font-semibold ${copied
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {copied ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Copied!
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Copy className="w-4 h-4" />
                                                        Copy Number
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Instructions */}
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                            <h4 className="font-semibold text-yellow-900 mb-3">Payment Instructions:</h4>
                            <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
                                <li>Open GCash app or scan the QR code above</li>
                                <li>Send ₱{bookingData.totalAmount} to the manager's GCash number</li>
                                <li>Include your Booking ID in the transaction reference: <span className="font-mono bg-yellow-100 px-2 py-1 rounded text-xs">{bookingId}</span></li>
                                <li>Your booking will be confirmed once payment is verified</li>
                                <li>Check your SMS for confirmation receipt</li>
                            </ol>
                        </div>

                        {/* Important Notes */}
                        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">⏰ Important:</h4>
                            <p className="text-sm text-blue-800">
                                Your dates are reserved for 24 hours. Please complete payment within this time to finalize your booking. After 24 hours, your reservation will be automatically cancelled if payment is not received.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}