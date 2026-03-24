export default async function userRegister(
    name: string,
    email: string,
    password: string,
    tel: string
) {
    const response = await fetch(
        "https://project-bn-sorawat.vercel.app/api/v1/auth/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password, tel }),
        }
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to register");
    }

    return await response.json();
}