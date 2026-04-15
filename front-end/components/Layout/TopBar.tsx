'use client'

import { Box } from '@mui/material';
import { useTheme } from "@/Context/ThemeProvider";
import MenuIcon from "@mui/icons-material/Menu";
import Image from 'next/image';
import { useState,useEffect } from 'react';

const TopBar = () => {


    const { isSideBarOpen, istoggleSideBar, setIsToggleSideBar, setIsSideBarOpen } = useTheme();

    useEffect(()=>{
        setIsToggleSideBar(true)
        setIsSideBarOpen(true)
    },[])
    return (
        <div style={{width:"100%", minHeight: "50px", backgroundColor: "rgb(9, 1, 17)", 
        color: "white", borderBottom: "3px solid rgb(138, 134, 134)", 
        display: "flex", justifyContent: "space-between", alignItems: "center",padding:"0px 10px" }}>
            <div style={{width:"max-content", height: "100%" }}>
                <button style={{width:"30px",height:"30px",borderRadius:"50px",backgroundColor:"transparent",outline:"none",color:"white",border:"none"}}
                onClick={()=>{setIsToggleSideBar(istoggleSideBar?false:true);setIsSideBarOpen(true)}}
                >
                    <MenuIcon sx={{cursor:"pointer",height:"30px",width:"30px"}}/>
                </button>
                
            </div>
            <div style={{flex:"1"}}>

            </div>

            <div style={{width:"100px",height:"100%",display:"flex",justifyContent:"flex-end"}}>
                <div style={{height:"100%",display:"flex",justifyContent:"flex-end"}}>
                    <p>Suganth B</p>
                    
                </div>
                
            </div>
        </div>
    )
}


export default TopBar