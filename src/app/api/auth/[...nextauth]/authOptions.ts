import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import userLogIn from "@/libs/userLogIn"

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/signin"
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) return null
                try {
                    const userResponse = await userLogIn(credentials.email, credentials.password)
                    if (userResponse && userResponse.token) {
                        return {
                            id: userResponse._id,
                            name: userResponse.name,
                            email: userResponse.email,
                            token: userResponse.token,
                            role: userResponse.role,  
                        }
                    }
                    return null
                } catch (error) {
                    console.error("Login Error:", error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            return { ...token, ...user }
        },
        async session({ session, token }: any) {
            session.user = token
            return session
        }
    }
}