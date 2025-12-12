"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { JSX } from "react";

export default function LandingPage(): JSX.Element {
    return (
        <main className="min-h-screen text-slate-900">
        
            {/* Hero */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid gap-8 md:grid-cols-2 items-center">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight ">
                            Reservation made easy for Pickle Ball courts
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 max-w-xl">
                            ConvergeIT helps teams ship modern full-stack applications with a
                            suite of UI components, patterns, and developer-friendly tooling.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/signup">
                                <Button>Get started</Button>
                            </Link>
                          
                        </div>

                    
                    </div>

                    <div>
                        <div className="rounded-lg border p-6 shadow-sm">
                            <h3 className="text-lg font-medium">Live preview</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                A quick demo of a component-driven page using our UI kit.
                            </p>

                            <div className="mt-4 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dashboard</CardTitle>
                                        <CardDescription>Product metrics & insights</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-24 bg-gradient-to-r from-slate-50 to-white rounded" />
                                    </CardContent>
                                    <CardFooter>
                                        <div className="text-xs text-slate-500">Updated 5m ago</div>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-semibold">What you get</h2>
                <p className="mt-2 text-slate-600 max-w-2xl">
                    A curated set of components, layouts, and examples to bootstrap your
                    Next.js apps using Tailwind + Shadcn UI.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Components</CardTitle>
                            <CardDescription>Reusable, accessible UI primitives</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Build consistent UI with a design system that scales across apps.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patterns</CardTitle>
                            <CardDescription>Common layouts & flows</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Authentication, dashboards, forms, and more — ready to plug in.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Developer DX</CardTitle>
                            <CardDescription>Fast feedback loop</CardDescription>
                        </CardHeader>
                        <CardContent>
                            TypeScript-first components and example pages to accelerate
                            development.
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Newsletter / CTA */}
            {/* <section id="contact" className="container mx-auto px-4 py-12">
            <div className="rounded-lg bg-slate-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-medium">Stay in the loop</h3>
                    <p className="mt-1 text-sm text-slate-600">
                        Get product updates, tips, and starter templates.
                    </p>
                </div>

                <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
                    <Input placeholder="Your email" aria-label="Email" />
                    <Button type="submit">Subscribe</Button>
                </form>
            </div>
        </section> */}

            {/* Footer */}
            <footer className="border-t py-8">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">© {new Date().getFullYear()} Pickle Ball Reservation</div>
                    <div className="flex gap-4 text-sm">
                        <Link href="/privacy" className="hover:underline">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:underline">
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}