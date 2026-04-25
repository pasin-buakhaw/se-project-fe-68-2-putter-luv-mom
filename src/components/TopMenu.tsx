import Link from 'next/link';
import AuthButton from './AuthButton';
import { AudioWaveform, UtensilsCrossed, CalendarPlus, CalendarCheck, BookOpen, MapPin, Search, Receipt } from 'lucide-react';

export default function TopMenu() {
    return (
        <div className="h-16 bg-black fixed top-0 w-full z-50 border-b border-yellow-600/40">
            <div className="max-w-7xl mx-auto h-full px-6 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <AudioWaveform className="text-yellow-500" size={22} />
                    <h1 className="font-playfair text-xl font-bold tracking-widest text-yellow-500">
                        NEWWAVE
                    </h1>
                </Link>

                {/* Nav */}
                <div className="flex items-center gap-2">

                    {/* Search */}
                    <Link
                        href="/search"
                        className="group flex items-center gap-0 overflow-hidden
                                   p-2 text-yellow-500 border border-yellow-500/50
                                   hover:bg-yellow-500 hover:text-black
                                   transition-all duration-300"
                    >
                        <Search size={16} />
                        <span className="max-w-0 group-hover:max-w-[80px] overflow-hidden
                                         whitespace-nowrap transition-all duration-300
                                         text-xs font-medium group-hover:ml-2">
                            Search
                        </span>
                    </Link>

                    {/* Restaurants */}
                    <Link
                        href="/venue"
                        className="group flex items-center gap-0 overflow-hidden
                                   p-2 text-yellow-500 border border-yellow-500/50
                                   hover:bg-yellow-500 hover:text-black
                                   transition-all duration-300"
                    >
                        <UtensilsCrossed size={16} />
                        <span className="max-w-0 group-hover:max-w-[100px] overflow-hidden
                                         whitespace-nowrap transition-all duration-300
                                         text-xs font-medium group-hover:ml-2">
                            Restaurants
                        </span>
                    </Link>

                    {/* New Reservation */}
                    <Link
                        href="/booking"
                        className="group flex items-center gap-0 overflow-hidden
                                   p-2 text-yellow-500 border border-yellow-500/50
                                   hover:bg-yellow-500 hover:text-black
                                   transition-all duration-300"
                    >
                        <CalendarPlus size={16} />
                        <span className="max-w-0 group-hover:max-w-[140px] overflow-hidden
                                         whitespace-nowrap transition-all duration-300
                                         text-xs font-medium group-hover:ml-2">
                            New Reservation
                        </span>
                    </Link>

                    {/* Menu */}
                    <Link
                        href="/menu"
                        className="group flex items-center gap-0 overflow-hidden
                                   p-2 text-yellow-500 border border-yellow-500/50
                                   hover:bg-yellow-500 hover:text-black
                                   transition-all duration-300"
                    >
                        <BookOpen size={16} />
                        <span className="max-w-0 group-hover:max-w-[80px] overflow-hidden
                                         whitespace-nowrap transition-all duration-300
                                         text-xs font-medium group-hover:ml-2">
                            Menu
                        </span>
                    </Link>

                    {/* Order History */}
                    <Link
                        href="/order-history"
                        className="group flex items-center gap-0 overflow-hidden
                                   p-2 text-yellow-500 border border-yellow-500/50
                                   hover:bg-yellow-500 hover:text-black
                                   transition-all duration-300"
                    >
                        <Receipt size={16} />
                        <span className="max-w-0 group-hover:max-w-[120px] overflow-hidden
                                         whitespace-nowrap transition-all duration-300
                                         text-xs font-medium group-hover:ml-2">
                            Order History
                        </span>
                    </Link>

                    {/* Map */}
                    <Link
                        href="/map"
                        className="group flex items-center gap-0 overflow-hidden
                                   p-2 text-yellow-500 border border-yellow-500/50
                                   hover:bg-yellow-500 hover:text-black
                                   transition-all duration-300"
                    >
                        <MapPin size={16} />
                        <span className="max-w-0 group-hover:max-w-[80px] overflow-hidden
                                         whitespace-nowrap transition-all duration-300
                                         text-xs font-medium group-hover:ml-2">
                            Map
                        </span>
                    </Link>

                    {/* My Reservations */}
                    <Link
                        href="/mybooking"
                        className="group flex items-center gap-0 overflow-hidden
                                   p-2 text-yellow-500 border border-yellow-500/50
                                   hover:bg-yellow-500 hover:text-black
                                   transition-all duration-300"
                    >
                        <CalendarCheck size={16} />
                        <span className="max-w-0 group-hover:max-w-[140px] overflow-hidden
                                         whitespace-nowrap transition-all duration-300
                                         text-xs font-medium group-hover:ml-2">
                            My Reservations
                        </span>
                    </Link>

                    <AuthButton />
                </div>
            </div>
        </div>
    )
}