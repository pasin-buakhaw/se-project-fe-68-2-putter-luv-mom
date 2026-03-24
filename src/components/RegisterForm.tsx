"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import userRegister from "@/libs/userRegister"

export default function RegisterForm() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        tel: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        setError("")

        if (!form.name || !form.email || !form.password || !form.tel) {
            setError("Please fill in all fields")
            return
        }
        if (!agreed) {
            setError("Please agree to the Terms of Service and Privacy Policy")
            return
        }
        if (form.password.length <= 8) {
            setError("Password must exceed 8 characters")
            return
        }

        setLoading(true)
        try {
            await userRegister(form.name, form.email, form.password, form.tel)
            router.push("/signin")
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-[#0f1624] border border-yellow-600/40 px-8 py-10">

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="font-playfair text-4xl font-bold text-yellow-500 mb-2">Register</h1>
                    <p className="text-gray-400 text-sm">Create your exclusive membership account</p>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                )}

                {/* Full Name */}
                <div className="mb-5">
                    <label className="text-white text-sm mb-1 block">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-[#1a2235] border border-yellow-600/50 text-white 
                                   placeholder-gray-500 px-4 py-3 text-sm outline-none
                                   focus:border-yellow-500 transition-colors"
                    />
                </div>

                {/* Email */}
                <div className="mb-1">
                    <label className="text-white text-sm mb-1 block">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-[#1a2235] border border-yellow-600/50 text-white 
                                   placeholder-gray-500 px-4 py-3 text-sm outline-none
                                   focus:border-yellow-500 transition-colors"
                    />
                    <p className="text-yellow-600 text-xs mt-1">Email must be valid</p>
                </div>

                {/* Password */}
                <div className="mb-1 mt-4">
                    <label className="text-white text-sm mb-1 block">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Create a secure password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-[#1a2235] border border-yellow-600/50 text-white 
                                       placeholder-gray-500 px-4 py-3 text-sm outline-none
                                       focus:border-yellow-500 transition-colors pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className="text-yellow-600 text-xs mt-1">Password must exceed 8 characters</p>
                </div>

                {/* Phone */}
                <div className="mb-6 mt-4">
                    <label className="text-white text-sm mb-1 block">Phone Number</label>
                    <input
                        type="tel"
                        name="tel"
                        placeholder="Enter your phone number"
                        value={form.tel}
                        onChange={handleChange}
                        className="w-full bg-[#1a2235] border border-yellow-600/50 text-white 
                                   placeholder-gray-500 px-4 py-3 text-sm outline-none
                                   focus:border-yellow-500 transition-colors"
                    />
                </div>

                {/* Checkbox */}
                <div className="flex items-start gap-3 mb-6">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-yellow-500 cursor-pointer"
                    />
                    <div className="text-sm text-gray-400">
                        I agree to the{" "}
                        <span className="text-yellow-500 cursor-pointer hover:underline">Terms of Service</span>
                        {" "}and{" "}
                        <span className="text-yellow-500 cursor-pointer hover:underline">Privacy Policy</span>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 
                               text-white font-semibold text-base 
                               transition-all duration-200 disabled:opacity-50"
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

                {/* Divider */}
                <div className="border-t border-gray-700 my-6" />

                {/* Sign In link */}
                <div className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-yellow-500 hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}