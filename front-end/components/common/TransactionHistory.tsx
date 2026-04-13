'use client';

import {useState } from 'react'
import React from 'react'
import '@/Styles/history/History.css'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';


const TransactionHistory = ({ data,handleDeleteRow }: any) => {
    return (
        <div className='row-container'>
            {
                data.length > 0 && (
                    data.map((item: any, index: number) => (
                        <React.Fragment key={index}>
                            <div className='row' >
                                <div className="field-container">
                                    {item?.reason}
                                </div>
                                <div className="field-container">
                                    {item?.date}
                                </div>
                                <div style={{display:"flex",alignItems:"center",fontSize:"18px",fontWeight:"bold",color:"rgb(93, 203, 93)"}}>
                                    <CurrencyRupeeIcon sx={{fontSize:"18px"}}/>{item?.amount}
                                </div>
                                <button onClick={()=>{handleDeleteRow(item?.id)}}>
                                    DEL
                                </button>
                            </div>
                        </React.Fragment>
                    ))
                )
            }
            {
                data.length<1&&(
                    <div style={{textAlign:"center"}}>
                        No Data Available !!!
                    </div>
                )
            }


        </div>
    )
}

export default TransactionHistory