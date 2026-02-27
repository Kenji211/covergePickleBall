import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Condensed, Oswald } from "next/font/google";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  weight: '400',
  subsets: ['latin'],
})

const oswald = Oswald({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "PickleBook",
  description: "Converge Pickleball Reservation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head >
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></meta>
      </head>
      <body
        className={`${oswald.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
