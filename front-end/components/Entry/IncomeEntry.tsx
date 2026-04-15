'use client';

import { Box, Button, Typography } from "@mui/material";
import '@/Styles/Entry/AllEntry.css'
import { useState, useEffect } from "react";
import DialogueBox from '@/components/MuiComponents/DialogueContainer'
import TransactionHistory from "../common/TransactionHistory";
import { useAuthContext } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import { BASE_URL, INCOME } from "@/ENUM";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';


const IncomeEntry = () => {

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const router = useRouter();

    const { user, setOpenSnackbar, setMessage, setStatusMessage, apiRequest } = useAuthContext();
    const [amount, setAmount] = useState<number>(0);
    const [reason, setReason] = useState<string>("");
    const [historyData, setHistoryData] = useState([]);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [thisMonthIncome, setThisMonthIncome] = useState<number>(0);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);

    useEffect(() => {
        if (!user) return;
        fetchIncomeHistory();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        fetchTotalIncome();
        fetchThisMonthIncome();
    }, [historyData]);

    const fetchTotalIncome = async () => {
        console.log(user?.id)
        const res = await fetch(`${BASE_URL}${INCOME}/total-income?user_id=${user?.id}`);
        const data = await res.json()
        console.log(data)
        if (data?.code == 200) {
            setTotalIncome(data?.total)
        }
    }

    const fetchThisMonthIncome = async () => {
        console.log(user?.id)
        const res = await fetch(`${BASE_URL}${INCOME}/this-month-income?user_id=${user?.id}`);
        const data = await res.json()
        console.log(data)
        if (data?.code == 200) {
            setThisMonthIncome(data?.total)
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
    }

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false)
        setConfirmDeleteId(null)
    }

    const addIncome = () => {
        console.log("Dialog Added")
        setOpenDialog(true)
    }

    const fetchIncomeHistory = async () => {
        const res = await fetch(`${BASE_URL}${INCOME}/income-history?user_id=${user?.id}`)
        const data = await res.json()
        console.log(data)
        if (data?.code == 200) {
            setHistoryData(data?.data)
        }
        handleCloseDialog();

    }

    const postIncome = async (obj: any) => {
        const res = await fetch(`${BASE_URL}${INCOME}/post-income`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(obj),

        })
        const data = await res.json();
        fetchIncomeHistory()

    }

    const handleAddIncome = () => {
        if (!amount) {
            setMessage("Please Fill the Amount")
            setStatusMessage("warning")
            setOpenSnackbar(true)
            return
        }
        else if (!reason || reason.length < 1) {
            setMessage("Please Fill the Reason")
            setStatusMessage("warning")
            setOpenSnackbar(true)
            return
        }
        else {
            const obj = { "user_id": user?.id, amount, reason }
            console.log(obj)
            postIncome(obj);
        }
    }

    const handleDeleteRow = async (id: any) => {
        setConfirmDeleteId(id)
        setOpenDeleteDialog(true)
    }

    const confirmDelete = async () => {
        setOpenDeleteDialog(false)

        if (!user?.id) {
            setMessage("Unable to verify user before delete")
            setStatusMessage("warning")
            setOpenSnackbar(true)
            setConfirmDeleteId(null)
            return
        }

        const res = await fetch(`${BASE_URL}${INCOME}/delete-entry`, {
            method: "DELETE",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({ id: confirmDeleteId, user_id: user.id })
        })

        const data = await res?.json()

        if (data?.code == 200) {
            setMessage("Deleted Successfully")
            setStatusMessage("success")
            setOpenSnackbar(true)
            fetchIncomeHistory()
        }
        else {
            setMessage(data?.message || "Problem With Deleting")
            setStatusMessage("warning")
            setOpenSnackbar(true)
        }

        setConfirmDeleteId(null)
    }

    return (
        <div style={{ width: "100%", boxSizing: "border-box", padding: "10px" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "33% 33% 33%", gap: "10px" }}>
                <Box className="highlight-box">
                    <Typography className="Income">Total Income</Typography>
                    <Typography className="amt">{totalIncome > 0 ? totalIncome : 0}</Typography>
                </Box>
                <Box className="highlight-box">
                    <Typography className="Income">This Month Income</Typography>
                    <Typography className="amt">{thisMonthIncome > 0 ? thisMonthIncome : 0}</Typography>
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
                                onChange={(e) => { setAmount(Number(e.target.value)) }}
                                value={amount}
                            />
                        </div>

                        <div className="input-field Reason-field">
                            <p>Reason</p>
                            <textarea placeholder="Enter The Reason" style={{ height: "80px" }}
                                onChange={(e) => { setReason(String(e.target.value)) }}
                            ></textarea>
                        </div>


                        <div className="action-btn">
                            <button onClick={handleAddIncome}>Submit</button>
                        </div>
                    </div>
                }
            />

            <DialogueBox open={openDeleteDialog}
                handleClose={handleCloseDeleteDialog}
                heading="Delete Income"
                content={
                    <div className="input-container">
                        Are you sure you want to delete this entry?
                        <div className="action-btn" style={{display:"flex",padding:"10px",width:"100%",justifyContent:"flex-end"}}>
                            <button onClick={confirmDelete} style={{alignSelf:"right",backgroundColor:"orange",marginRight:"10px"}}>Yes</button>
                            <button onClick={handleCloseDeleteDialog} style={{alignSelf:"right"}}>No</button>
                        </div>
                    </div>
                }
            />

            <div style={{ width: "100%", padding: "30px 2px 10px" }}>
                <p className="heading">Income History</p>
                <TransactionHistory data={historyData} handleDeleteRow={handleDeleteRow} />
            </div>
        </div>
    )
}


export default IncomeEntry;