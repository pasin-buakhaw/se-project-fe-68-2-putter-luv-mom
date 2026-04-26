"use client";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Banner() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const userName = (session?.user as any)?.name || (session?.user as any)?.email || "User"

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <img
                src="/banner2.png"
                alt="banner2"
                className="w-full h-full opacity-40 object-cover absolute inset-0"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                            flex flex-col items-center gap-6 text-center w-full px-6">

                {/* Tag line */}
                <p className="text-yellow-500 text-xs tracking-[0.4em] uppercase font-medium">
                    Fine Dining Experience
                </p>

                {/* Heading */}
                <div className="flex flex-col items-center gap-2">
                    {status === "loading" ? (
                        <div className="h-16 w-64 bg-white/5 animate-pulse rounded" />
                    ) : session ? (
                        <>
                            <h1 className="text-white font-playfair text-3xl font-normal tracking-wide">
                                Welcome back,
                            </h1>
                            <h1 className="text-yellow-500 font-playfair text-5xl font-bold tracking-widest">
                                {userName}
                            </h1>
                        </>
                    ) : (
                        <>
                            <h1 className="text-white font-playfair text-3xl font-normal tracking-wide">
                                The Pinnacle of
                            </h1>
                            <h1 className="text-yellow-500 font-playfair text-5xl font-bold tracking-widest">
                                Culinary Art
                            </h1>
                        </>
                    )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 w-48">
                    <div className="flex-1 h-px bg-yellow-500/40" />
                    <span className="text-yellow-500/60 text-xs">★</span>
                    <div className="flex-1 h-px bg-yellow-500/40" />
                </div>

                {/* Subtext */}
                <p className="text-gray-300 text-sm font-light max-w-sm tracking-widest leading-relaxed">
                    Experience unparalleled luxury dining where every dish is a masterpiece
                </p>

                {/* Buttons */}
                <div className="mt-2 flex items-center gap-4 flex-wrap justify-center">
                    <button
                        className="text-xs font-medium px-8 py-3
                                   text-black bg-yellow-500
                                   hover:bg-yellow-400
                                   tracking-[0.3em] uppercase
                                   transition-all duration-300"
                        onClick={() => router.push('/search')}
                    >
                        Search Restaurant
                    </button>
                    <button
                        className="text-xs font-medium px-8 py-3
                                   text-yellow-500 bg-transparent border border-yellow-500/60
                                   hover:bg-yellow-500/10
                                   tracking-[0.3em] uppercase
                                   transition-all duration-300"
                        onClick={() => router.push('/booking')}
                    >
                        Book a Table
                    </button>
                </div>
            </div>
        </div>
    );
}