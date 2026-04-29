import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { DialogContentText } from '@mui/material';


const DialogBox = ({open,handleClose,heading,content}:any) => {
    return (
        <>
            <Dialog
                fullWidth={true}
                // maxWidth={maxWidth}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle sx={{fontSize:"30px"}}>{heading}</DialogTitle>
                <DialogContent>
                    {content}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default DialogBox