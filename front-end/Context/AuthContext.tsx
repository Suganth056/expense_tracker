"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL, SIGN_UP, LOGIN } from "@/ENUM";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
    user: any;
    signUp: (params: any) => Promise<any>;
    login: (params: any) => Promise<any>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<any>(null);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (params: any) => {
        try {
            const res = await fetch(`${BASE_URL}${LOGIN}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            const data = await res.json();

            if (data.code === 200) {
                // ✅ Store tokens
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("refresh_token", data.refresh_token);

                // ✅ Store user
                localStorage.setItem("user", JSON.stringify(data.user));
                setUser(data.user);
            }

            return data;
        } catch (err) {
            console.error("Login Error:", err);
            return { code: 500, message: "Server error" };
        }
    };

    const signUp = async (params: any) => {
        try {
            const res = await fetch(`${BASE_URL}${SIGN_UP}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            return await res.json();
        } catch (err) {
            console.error("Signup Error:", err);
            return { code: 500, message: "Server error" };
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signUp, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuthContext must be used inside AuthProvider");
    }

    return context;
};