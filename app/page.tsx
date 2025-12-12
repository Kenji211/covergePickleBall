import Image from "next/image";
import LandingPage from "./pages/landingPage";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans dark:bg-black">
     <LandingPage/>
    </div>
  );
}
