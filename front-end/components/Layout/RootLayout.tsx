'use client';

import { Box } from "@mui/material";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { useTheme } from "@/Context/ThemeProvider";
import { usePathname } from "next/navigation";

// Pages / Components
import Dashboard from '@/components/Dashboard';
import IncomeEntry from '@/components/Entry/IncomeEntry';

const RootLayout = () => {
    const { isSideBarOpen } = useTheme();
    const pathName = usePathname();

    // Handle routing manually
    const renderComponent = () => {
        switch (pathName) {
            case '/':
                return <Dashboard />;

            case '/income-entry':
                return <IncomeEntry />;

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
                boxSizing: "border-box"
            }}
        >
            {/* Sidebar */}
            <SideBar />

            {/* Main Content */}
            <Box sx={{ flex: 1 }}>
                <TopBar />

                <main style={{ padding: "16px" }}>
                    {renderComponent()}
                </main>
            </Box>
        </div>
    );
};

export default RootLayout;