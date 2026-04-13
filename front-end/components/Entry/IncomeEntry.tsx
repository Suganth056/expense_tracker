'use client';

import { Box, Button, Typography } from "@mui/material";
import '@/Styles/Entry/AllEntry.css'
import { useState,useEffect } from "react";
import DialogueBox from '@/components/MuiComponents/DialogueContainer'
import { useAuthContext } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import { BASE_URL,INCOME } from "@/ENUM";

const IncomeEntry = () => {

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const router = useRouter();
    
    const {user,setOpenSnackbar,setMessage,setStatusMessage,apiRequest} = useAuthContext();
    const [amount,setAmount] = useState<number>(0);
    const [reason,setReason] = useState<string>("");
    
    useEffect(()=>{
        if(!user){
            setStatusMessage("error")
            setMessage("Invalid Credential")
            setOpenSnackbar(true)
            router.push("/login")
        }
        else{
            console.log(user)
        }
    })

    const handleCloseDialog = () => {
        setOpenDialog(false)
    }

    const addIncome = () => {
        console.log("Dialog Added")
        setOpenDialog(true)
    }

    const postIncome = async(obj:any)=>{
        const res = await fetch(`${BASE_URL}${INCOME}`,{
            method:"POST",
            headers:{
                'Content-Type':"application/json"
            },
            body:JSON.stringify(obj),

        })
        const data=await res.json();
        console.log(data)
    }

    const handleAddIncome = ()=>{
        if(!amount){
            setMessage("Please Fill the Amount")
            setStatusMessage("warning")
            setOpenSnackbar(true)
            return
        }
        else if(!reason || reason.length < 1){
            setMessage("Please Fill the Reason")
            setStatusMessage("warning")
            setOpenSnackbar(true)
            return
        }
        else{
            const obj = {"user_id":user?.id,amount,reason}
            console.log(obj)
            postIncome(obj);
        }
    }

    return (
        <div style={{ width: "100%", boxSizing: "border-box", padding: "10px" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "33% 33% 33%", gap: "10px" }}>
                <Box className="highlight-box">
                    <Typography className="Income">Total Income</Typography>
                    <Typography className="amt">12000</Typography>
                </Box>
                <Box className="highlight-box">
                    <Typography className="Income">This Month Income</Typography>
                    <Typography className="amt">12000</Typography>
                </Box>
                <Box className="" sx={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", boxSizing: "border-box" }}>
                        <Button className="add" sx={{ alignSelf: "center", width: "50px", fontSize: "30px", border: "2px solid white", borderRadius: "100px", height: "50px" }}
                            onClick={() => { addIncome() }}
                        >+</Button>
                    </div>

                    <Typography className="amt" sx={{ textAlign: "center" }}>ADD</Typography>
                </Box>
            </Box>


            <DialogueBox open={openDialog}
                handleClose={handleCloseDialog}
                heading="Add Income"
                content={
                    <div className="input-container">
                        <div className="input-field amtEntry">
                            <p>Amount</p>
                            <input type="number" 
                            onChange={(e)=>{setAmount(Number(e.target.value))}}
                            value={amount}
                            />
                        </div>

                        <div className="input-field Reason-field">
                            <p>Reason</p>
                            <textarea placeholder="Enter The Reason" style={{ height: "80px" }}
                            onChange={(e)=>{setReason(String(e.target.value))}}
                            ></textarea>
                        </div>


                        <div className="action-btn">
                            <button onClick={handleAddIncome}>Submit</button>
                        </div>



                    </div>
                }
            />
        </div>
    )
}


export default IncomeEntry;