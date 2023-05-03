import { Button, Card, CardContent, Grid, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { ExpressBackendPort } from "../../constant";

export const fetchWithTimeout = async (resource: string, options: any = {},) => {
    const { timeout = 800000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

const Transfer = () => {
    const [toAddress, setToAddress] = useState("");
    const [newPk, setNewPk] = useState("");
    // TODO: Abstract out transferRecord and feeRecord, in the background can probably query beacon and get the records directly....
    const [transferAmount, setTransferAmount] = useState("");
    const [transferRecord, setTransferRecord] = useState("");
    const [feeRecord, setFeeRecord] = useState("");
    const [feeAmount, setFeeAmount] = useState("");
    // const [address, setAddress] = useState("");
    // const [recordToTransfer, setRecordToTransfer] = useState("");
    // const [viewKey, setViewKey] = useState("");
    // const [ciphertext, setCiphertext] = useState("");


    const sendCredits = async () => {
        try {
            const response = await fetchWithTimeout(`http://127.0.0.1:${ExpressBackendPort}/aleo/transfer`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "aleo_address": toAddress, "private_key": newPk, "transfer_record": transferRecord, "transfer_amount": transferAmount, "fee_record": feeRecord, "fee_amount": feeAmount}),
                timeout: 2400000 // 4 minute
            });
            // const responseData = await response.json();
            // setAleoResponse(responseData["output"]);
        } catch (error: any) {
            if (error.name === 'AbortError') {

                // setAleoResponse("Request timed out!");
            }
        }
        // setOutput(JSON.stringify(responseData, null, 2));
    }

    // const decrypt = async () => {
    //     const response = await fetch(`http://127.0.0.1:${ExpressBackendPort}/aleo/decrypt`, {
    //         method: "POST",
    //         headers: {
    //             "Accept": "application/json",
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ "view_key": viewKey, "ciphertext": ciphertext }),
    //     });
    //     const responseData = await response.json();
    //     setOutput(responseData["output"]);
    // }

    return <Paper
        sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            marginX: 8,
            overflow: 'auto'
        }}
    >
        <Grid container spacing={5} sx={{ pl: 2 }}>
            <Grid item xs={12}>
                <Typography variant="h5">Aleo Address to Transfer To</Typography>
                <TextField value={toAddress} label="Address" variant="outlined" sx={{ marginTop: 2, width: "50vw" }} onChange={(newAddress) => setToAddress(newAddress.target.value)}></TextField>
                {/* <Button variant="contained" sx={{ marginTop: 3, marginLeft: 5 }} onClick={getTranslation}>Submit</Button> */}
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5">Private Key of Address With Funds</Typography>
                <TextField value={newPk} label="PrivateKey" variant="outlined" sx={{ marginTop: 2, width: "50vw" }} onChange={(pk) => setNewPk(pk.target.value)}></TextField>
                {/* <Button variant="contained" sx={{ marginTop: 3, marginLeft: 5 }} onClick={getTranslation}>Submit</Button> */}
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5">Record to Transfer (with quotes)</Typography>
                <TextField value={transferRecord} label="TransferRecord" variant="outlined" sx={{ marginTop: 2, width: "50vw" }} onChange={(record) => setTransferRecord(record.target.value)}></TextField>
                {/* <Button variant="contained" sx={{ marginTop: 3, marginLeft: 5 }} onClick={getTranslation}>Submit</Button> */}
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5">Amount of Credits to Transfer</Typography>
                <TextField value={transferAmount} label="TransferAmount" variant="outlined" sx={{ marginTop: 2, width: "50vw" }} onChange={(credits) => setTransferAmount(credits.target.value)}></TextField>
                {/* <Button variant="contained" sx={{ marginTop: 3, marginLeft: 5 }} onClick={sendCredits}>Submit</Button> */}
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5">Record for fee (with quotes)</Typography>
                <TextField value={feeRecord} label="FeeRecord" variant="outlined" sx={{ marginTop: 2, width: "50vw" }} onChange={(record) => setFeeRecord(record.target.value)}></TextField>
                {/* <Button variant="contained" sx={{ marginTop: 3, marginLeft: 5 }} onClick={sendCredits}>Submit</Button> */}
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5">Fee Amount</Typography>
                <TextField value={feeAmount} label="FeeAmount" variant="outlined" sx={{ marginTop: 2, width: "50vw" }} onChange={(fee) => setFeeAmount(fee.target.value)}></TextField>
                <Button variant="contained" sx={{ marginTop: 3, marginLeft: 5 }} onClick={sendCredits}>Submit</Button>
            </Grid>
        </Grid>
    </Paper>
}

export default Transfer;