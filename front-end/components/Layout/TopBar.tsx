'use client'

import { useTheme } from "@/Context/ThemeProvider";
import { useAuthContext } from "@/Context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect } from 'react';
import '@/Styles/layout/TopBar.css';

const TopBar = () => {
    const { user, logout } = useAuthContext();
    const { istoggleSideBar, setIsToggleSideBar, setIsSideBarOpen } = useTheme();

    useEffect(() => {
        setIsToggleSideBar(true);
        setIsSideBarOpen(true);
    }, []);

    const displayName = user?.name || user?.user_name || user?.phone_no || 'Guest';

    return (
        <header className="topbar">
            <button
                className="topbar-menu"
                onClick={() => {
                    setIsToggleSideBar(!istoggleSideBar);
                    setIsSideBarOpen(true);
                }}
            >
                <MenuIcon />
            </button>

            <div className="topbar-brand">
                <p>Expense Tracker</p>
            </div>

            <div className="topbar-profile" style={{width:"max-content"}}>
                <span className="topbar-profile-avatar">
                    {displayName?.toString().charAt(0).toUpperCase()}
                </span>
                <div>
                    <p className="topbar-profile-greeting">Welcome back</p>
                    <p className="topbar-profile-name">{displayName}</p>
                </div>
                {user && (
                    <button className="topbar-logout-button" onClick={logout}>
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
};

export default TopBar