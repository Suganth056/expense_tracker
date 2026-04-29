'use client';

import { Box } from "@mui/material";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { useTheme } from "@/Context/ThemeProvider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/Context/AuthContext";

// Pages / Components
import Dashboard from '@/components/Dashboard';
import IncomeEntry from '@/components/Entry/IncomeEntry';
import ExpenditureEntry from '@/components/Entry/ExpenditureEntry';

const RootLayout = () => {
    const { isSideBarOpen } = useTheme();
    const pathName = usePathname();
    const { user, accessToken, isTokenExpired, refreshAccessToken } = useAuthContext();

    useEffect(() => {
        const validateToken = async () => {
            if (user && !accessToken) {
                await refreshAccessToken();
                return;
            }

            if (accessToken && isTokenExpired(accessToken)) {
                await refreshAccessToken();
            }
        };

        validateToken();
    }, [user, accessToken, isTokenExpired, refreshAccessToken]);

    // Handle routing manually
    const renderComponent = () => {
        switch (pathName) {
            case '/':
                return <Dashboard />;

            case '/income-entry':
                return <IncomeEntry />;
            case '/expense-entry':
                return <ExpenditureEntry />

            default:
                return <div>Page Not Found</div>;
        }
    };

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                height: "100vh",
                boxSizing: "border-box",
                overflowX: "hidden"
            }}
        >
            {/* Sidebar */}
            <SideBar />

            {/* Main Content */}
            <Box sx={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
                <TopBar />

                <main style={{ padding: "16px", boxSizing: "border-box" }}>
                    {renderComponent()}
                </main>
            </Box>
        </div>
    );
};

export default RootLayout;