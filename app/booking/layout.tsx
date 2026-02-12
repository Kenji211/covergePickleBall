"use client";

export default function BookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="flex-1 w-full">
                <main className="">
                    {children}
                </main>
            </div>
    );
}
