"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL, SIGN_UP, LOGIN } from "@/ENUM";
import { jwtDecode } from "jwt-decode";
import { Alert, Snackbar } from '@mui/material';
import { AlertColor } from "@mui/material";

interface AuthContextType {
    user: any;
    accessToken: string | null;
    openSnackbar: boolean;
    message: string | null;
    statusMessage: any;
    setStatusMessage: (params: any) => void;
    setMessage: (params: any) => void;
    setOpenSnackbar: (params: any) => void;
    signUp: (params: any) => Promise<any>;
    login: (params: any) => Promise<any>;
    logout: () => void;
    apiRequest: (url: string, options?: any) => Promise<any>;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(true);
    const [message, setMessage] = useState(null);
    const [statusMessage, setStatusMessage] = useState<AlertColor>("success");


    // 🔍 Check token expiry
    const isTokenExpired = (token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    // 🔁 Refresh Access Token
    const refreshAccessToken = async () => {
        try {
            const res = await fetch(`${BASE_URL}/refresh`, {
                method: "POST",
                credentials: "include", // 🔥 important
            });

            const data = await res.json();

            if (data.code === 200) {
                setAccessToken(data.access_token);
                return data.access_token;
            }

            return null;
        } catch (err) {
            return null;
        }
    };

    // 🚀 MAIN API HANDLER
    const apiRequest = async (url: string, options: any = {}) => {
        let token = accessToken;

        // 🔍 Check before request
        if (!token || isTokenExpired(token)) {
            token = await refreshAccessToken();

            if (!token) {
                logout();
                return null;
            }
        }

        let res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        // 🔁 Fallback if backend says unauthorized
        if (res.status === 401) {
            token = await refreshAccessToken();

            if (!token) {
                logout();
                return null;
            }

            res = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
        }

        return res;
    };

    // 🔐 LOGIN
    const login = async (params: any) => {
        try {
            const res = await fetch(`${BASE_URL}${LOGIN}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
                credentials: "include", // 🔥 cookie support
            });

            const data = await res.json();

            if (data.code === 200) {
                setAccessToken(data.access_token);
                setUser(data.user);

                localStorage.setItem("user", JSON.stringify(data.user));
            }

            return data;
        } catch (err) {
            return { code: 500, message: "Server error" };
        }
    };

    // 📝 SIGNUP
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
            return { code: 500, message: "Server error" };
        }
    };

    // 🚪 LOGOUT
    const logout = async () => {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch { }

        setAccessToken(null);
        setUser(null);

        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    // 🔄 Restore user on reload
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleClose = () => {
        setOpenSnackbar(false)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                openSnackbar,
                message,
                statusMessage,
                setStatusMessage,
                setMessage,
                setOpenSnackbar,
                signUp,
                login,
                logout,
                apiRequest,
            }}


        >
            {
                message && (
                    <div>
                        <Snackbar
                            anchorOrigin={{ vertical: "top", horizontal: 'right' }} open={openSnackbar}
                            autoHideDuration={30000} onClose={handleClose}
                            sx={{
                                '& .MuiSnackbarContent-root': {
                                    padding: 0
                                }
                            }}

                        >

                            <Alert
                                onClose={handleClose}
                                severity={statusMessage}
                                variant="filled"
                                sx={{
                                    width: '300px',
                                    maxWidth: '300px',
                                    boxSizing: 'border-box'
                                }}

                            >
                                {message}
                            </Alert>

                        </Snackbar>
                    </div>
                )
            }


            {children}
        </AuthContext.Provider>
    );
};

// 🔗 Hook
export const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuthContext must be used inside AuthProvider");
    }

    return context;
};