// app/page.tsx
"use client";

import { useState } from "react";
import Home from "./home";
import AboutUs from "./aboutUs";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Page() {
  const [activeSection, setActiveSection] = useState<"home" | "about" | "booking" | "signup">("home");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLoginButton = () => {
    // Check if user is authenticated
    const token = localStorage.getItem("firebaseToken");
    if (!token) {
      router.push("/auth");
      return;
    } else
      router.push("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md z-50">
        <div className="container mx-auto px-4 py-8 flex items-center justify-between">

          {/* web view */}
          <nav className="hidden md:flex gap-14 justify-start w-1/3">
            <button
              className={`font-medium ${activeSection === "home" ? "text-blue-600" : "text-slate-600 hover:text-blue-400"}`}
              onClick={() => setActiveSection("home")}
            >
              Home
            </button>

            <button
              className={`font-medium ${activeSection === "booking" ? "text-blue-600" : "text-slate-600 hover:text-blue-400"}`}
              onClick={() => router.push("/booking/area")}
            >
              Book Now
            </button>

            <button
              className={`font-medium ${activeSection === "about" ? "text-blue-600" : "text-slate-600 hover:text-blue-400"}`}
              onClick={() => setActiveSection("about")}
            >
              About Us
            </button>
          </nav>

          <div className="md:hidden w-1/3 flex justify-start pl-4">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <h1 className="text-xl font-bold text-center w-1/3">PickleBook</h1>

          <div className="w-1/3 md:hidden"></div>
          <nav className="hidden md:flex pl-14 gap-14 justify-end w-1/3">
            <button
              className={`font-medium ${activeSection === "signup" ? "text-blue-600" : "text-slate-600 hover:text-blue-400"}`}
              onClick={handleLoginButton}
            >
              Login
            </button>
          </nav>
        </div>
        {/* mobile view */}
        {isOpen && (
          <div className="md:hidden bg-white shadow-md absolute w-full">
            <nav className="flex flex-col gap-4 px-4 py-4">
              <button
                className={`font-medium ${activeSection === "home" ? "text-blue-600" : "text-slate-600"}`}
                onClick={() => { setActiveSection("home"); setIsOpen(false); }}
              >
                Home
              </button>

              <button
                className="font-medium text-slate-600"
                onClick={() => { router.push("/booking/area"); setIsOpen(false); }}
              >
                Book Now
              </button>

              <button
                className={`font-medium ${activeSection === "about" ? "text-blue-600" : "text-slate-600"}`}
                onClick={() => { setActiveSection("about"); setIsOpen(false); }}
              >
                About Us
              </button>

              <button
                className={`font-medium ${activeSection === "signup" ? "text-blue-600" : "text-slate-600 hover:text-blue-400"}`}
                onClick={handleLoginButton}
              >
                Login
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Sections */}
      <main className="flex-1">
        {activeSection === "home" && <Home />}
        {activeSection === "about" && <AboutUs />}
        {activeSection === "booking"}
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 text-center py-6 text-slate-700">
        &copy; {new Date().getFullYear()} PickleBook. All rights reserved.
      </footer>
    </div>
  );
}
