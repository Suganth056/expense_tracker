'use client';

import {createContext,useState,useEffect,useContext} from 'react';
 
interface ThemeContextType{
    theme:string;
    isSideBarOpen:boolean;
    istoggleSideBar:boolean;
    isMobileView:boolean;
    setIsMobileView:(params:any) => any;
    setIsToggleSideBar:(params:any) => any;
    setIsSideBarOpen:(params:any) => any;
}


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider=({children}:any)=>{
    const [theme,setTheme] = useState('light');
    const [isSideBarOpen,setIsSideBarOpen] = useState<boolean>(true);
    const [istoggleSideBar,setIsToggleSideBar] = useState<boolean>(true);
    const [isMobileView,setIsMobileView] = useState<boolean>(true)
    
    return(
        <ThemeContext.Provider value={{theme,isSideBarOpen,istoggleSideBar,isMobileView,setIsMobileView,setIsToggleSideBar,setIsSideBarOpen}}>
            {children}
        </ThemeContext.Provider>
    )
}


export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
};