'use client'


import { Box } from "@mui/material";
import { useTheme } from "@/Context/ThemeProvider";
import '@/Styles/layout/SideBar.css'
import { navList } from "@/common/NavList";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SideBar = () => {
    const router = useRouter();
    const { isSideBarOpen, istoggleSideBar, isMobileView, setIsMobileView, setIsToggleSideBar, setIsSideBarOpen } = useTheme(); 
    const handlePageChange = (path:any)=>{
        console.log(path)
        router.push(path);
    }

    const handleSideBar = ()=>{
        setIsSideBarOpen(false)
    }
    
    return (
        <>
            {
                (
                    isSideBarOpen && (
                        <Box className="sidebar" sx={{ width: { xs: "70%", md: `${istoggleSideBar ? "15%" : "5%"}` }, height: "100vh", backgroundColor: "rgb(0, 0, 0)",position:{xs:"fixed",md:"relative"} }} >
                            <div style={{ display: "flex", width: "100%", textAlign: "center", padding: "5px", paddingTop: "15px" }}>
                                <h2 style={{ display: `${istoggleSideBar ? "block" : "none"}` }}>Expense Tracker</h2>
                            </div>
                            <p className="x-mark" style={{position:"absolute",top:"10px",right:"10px",color:"white",maxWidth:"max-content",cursor:"pointer",fontWeight:"bold"}} onClick={handleSideBar}>X</p>

                            <div className="nav-section" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                {
                                    navList.map((item: any, index: number) => {
                                        const Icon = item?.logo
                                        return(
                                        <div key={index} className="navList" onClick={()=>(handlePageChange(item?.path))}>
                                            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",width:"100%",textAlign:"center"}}>
                                                
                                                    <Icon />
                                                    <p style={{ display: `${istoggleSideBar ? "inline" : "none"}`,width:"max-content" }}>{item?.nav}</p>
                                                
                                                
                                            </div>
                                        </div>
                                    )})
                                }
                            </div>
                        </Box>
                    )
                )
            }
        </>


    )
}


export default SideBar;