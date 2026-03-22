import Image from 'next/image';
import TopMenuItem from './TopMenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import Link from 'next/link';

export default async function TopMenu() {
    const session = await getServerSession(authOptions);

    return (
        <div className="h-16 flex justify-between items-center bg-white shadow-md px-5 fixed top-0 w-full z-50">
            {/* ซ้าย: Sign-In / Sign-Out */}
            <div className="flex items-center gap-3">
                {session ? (
                    <Link
                        href="/api/auth/signout"
                        className="text-sm font-medium text-red-500 hover:text-red-700 
                                   px-3 py-1.5 rounded-lg border border-red-200 
                                   hover:bg-red-50 transition"
                    >
                        Sign-Out
                    </Link>
                ) : (
                    <Link
                        href="/api/auth/signin"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 
                                   px-3 py-1.5 rounded-lg border border-blue-200 
                                   hover:bg-blue-50 transition"
                    >
                        Sign-In
                    </Link>
                )}
                <TopMenuItem title="My Booking" href="/mybooking" />
            </div>

            {/* ขวา: Menu Navigation + Logo */}
            <div className="flex items-center gap-5">
                {/* เพิ่มเมนู My Booking เข้าไปตรงนี้ */}
                
                {/* เมนู Booking เดิม */}
                <TopMenuItem title="Booking" href="/booking" />
                
                {/* Logo ของระบบ */}
                <div className='flex items-center h-full'>
                    <Image src="/img/logo.png" alt="Logo" width={40} height={40} className='object-contain' />
                </div>
            </div>
        </div>
    );
}