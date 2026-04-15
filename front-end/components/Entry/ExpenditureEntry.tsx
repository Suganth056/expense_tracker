'use client';

import { Box, Button, Typography } from "@mui/material";
import '@/Styles/Entry/AllEntry.css'
import { useState, useEffect } from "react";
import DialogueBox from '@/components/MuiComponents/DialogueContainer'
import TransactionHistory from "../common/TransactionHistory";
import { useAuthContext } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import { BASE_URL, EXPENDITURE } from "@/ENUM";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PaginationComponent from "../MuiComponents/PaginationComponent";
import Pagination from "@mui/material/Pagination";

const ExpenditureEntry = () => {

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const router = useRouter();

    const { user, setOpenSnackbar, setMessage, setStatusMessage, apiRequest } = useAuthContext();
    const [amount, setAmount] = useState<number>(0);
    const [reason, setReason] = useState<string>("");
    const [historyData, setHistoryData] = useState([]);
    const [totalExp,setTotalExp] = useState<number>(0);
    const [thisMonthExp,setThisMonthExp] = useState<number>(0);
    const [openWarningDialog,setWarningOpeningDialog] = useState<boolean>(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);

    // Pagination States
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);


    useEffect(() => {
        if (!user) return;
        fetchExpenditureHistory()
    }, [user,page])

    useEffect(() => {
        if (!user) return;
        fetchTotalExp();
        fetchThisMonthExp();
    }, [historyData])

    const fetchTotalExp = async () => {
        console.log(user?.id)
        const res = await fetch(`${BASE_URL}${EXPENDITURE}/total-expenditure?user_id=${user?.id}`);
        const data = await res.json()
        console.log(data)
        if (data?.code == 200) {
            setTotalExp(data?.total)
        }
    }

    const fetchThisMonthExp = async () => {
        console.log(user?.id)
        const res = await fetch(`${BASE_URL}${EXPENDITURE}/this-month-expenditure?user_id=${user?.id}`);
        const data = await res.json()
        console.log(data)
        if (data?.code == 200) {
            setThisMonthExp(data?.total)
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
    }

    const handleCloseWarningDialog = () => {
        setWarningOpeningDialog(false)
        setConfirmDeleteId(null)
     }

     const confirmDelete = async () => {
        setWarningOpeningDialog(false)
        if (!confirmDeleteId) return

        if (!user?.id) {
            setMessage("Unable to verify user before delete")
            setStatusMessage("warning")
            setOpenSnackbar(true)
            setConfirmDeleteId(null)
            return
        }

        const res = await fetch(`${BASE_URL}${EXPENDITURE}/delete-entry`, {
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
            fetchExpenditureHistory()
        }
        else {
            setMessage(data?.message || "Problem With Deleting")
            setStatusMessage("warning")
            setOpenSnackbar(true)
        }

        setConfirmDeleteId(null)
     }

    const addExpenditure = () => {
        setOpenDialog(true)
    }

    const fetchExpenditureHistory = async () => {
        const res = await fetch(`${BASE_URL}${EXPENDITURE}/expenditure-history?user_id=${user?.id}&page=${page}`);
        const data = await res.json()
        console.log(data)
        if (data?.code == 200) {
            setHistoryData(data?.data)
            setTotalPages(data?.total_pages)
            console.log("Total Pages:", data?.total_pages);
        }
        handleCloseDialog();

    }

    const postExpenditure = async (obj: any) => {
        const res = await fetch(`${BASE_URL}${EXPENDITURE}/post-expenditure`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(obj),

        })
        const data = await res.json();
        fetchExpenditureHistory()

    }

    const handleAddExpenditure = () => {
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

            postExpenditure(obj);
        }
    }

    const handleDeleteRow = async (id: any) => {
        setConfirmDeleteId(id)
        setWarningOpeningDialog(true);
    }

    return (
        <div style={{ width: "100%", boxSizing: "border-box", padding: "10px" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "33% 33% 33%", gap: "10px" }}>
                <Box className="highlight-box">
                    <Typography className="Income">Total Expenditure</Typography>
                    <Typography className="amt">{totalExp>0?totalExp:0}</Typography>
                </Box>
                <Box className="highlight-box">
                    <Typography className="Income">This Month Expenditure</Typography>
                    <Typography className="amt">{thisMonthExp>0?thisMonthExp:0}</Typography>
                </Box>
                <Box className="" sx={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", boxSizing: "border-box" }}>
                        <Button className="add" sx={{ alignSelf: "center", width: "50px", fontSize: "30px", border: "2px solid white", borderRadius: "100px", height: "50px" }}
                            onClick={() => { addExpenditure() }}
                        >+</Button>
                    </div>

                    <Typography className="amt" sx={{ textAlign: "center" }}>ADD</Typography>
                </Box>
            </Box>


            <DialogueBox open={openDialog}
                handleClose={handleCloseDialog}
                heading="Add Expenditure"
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
                            <button onClick={() => { handleAddExpenditure() }}>Submit</button>
                        </div>
                    </div>
                }
            />

            <DialogueBox open={openWarningDialog}
                handleClose={handleCloseWarningDialog}
                heading="Delete Expenditure"
                content={
                    <div className="input-container">
                        Are you sure you want to delete this entry?
                        <div className="action-btn" style={{display:"flex",padding:"10px",width:"100%",justifyContent:"flex-end"}}>
                            <button onClick={confirmDelete} style={{alignSelf:"right",backgroundColor:"orange",marginRight:"10px"}}>Yes</button>
                            <button onClick={handleCloseWarningDialog} style={{alignSelf:"right"}}>No</button>
                        </div>
                    </div>
                }
            />


            <div style={{ width: "100%", padding: "30px 2px 10px" }}>
                <p className="heading">Expenditure History</p>
                <TransactionHistory data={historyData} handleDeleteRow={handleDeleteRow} />
            </div>
            <div className="pagination-container" >
                <PaginationComponent  data={historyData} count={totalPages} page={page} setPage={setPage} />

            </div>
        </div>
    )
}


export default ExpenditureEntry;