'use client';

import {createContext,useState,useEffect,useContext} from 'react';

interface ThemeContextType{
    theme:string
}


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider=({children}:any)=>{
    const [theme,setTheme] = useState('light');
    
    return(
        <ThemeContext.Provider value={{theme}}>
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