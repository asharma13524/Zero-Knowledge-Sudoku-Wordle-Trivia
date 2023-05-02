import './Sudoku.css';
import { Paper, Box, Grid, Stack, CircularProgress, Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import { fetchWithTimeout } from '../../utils/utils';
import { ethers } from "ethers";
import { Buffer } from 'buffer';

import SudokuVerifierABI from "../../abi/SudokuVerifier.json";
import ZK_NFT_ABI from "../../abi/ZK_NFT.json";
import { ExpressBackendPort, SudoKuVerifierNoirContractAddress, ZK_NFT_ContractAddress } from '../../constant';

export default function SudoKu() {
    const [puzzleArray, setPuzzleArray] = useState<number[][]>([]); // The original puzzle
    const [sudokuArray, setSudokuArray] = useState<string[][]>([]); // The sudoku array user is working on
    const [solutionArray, setSolutionArray] = useState<string[][]>([]); // The solution array
    const [isLoading, setIsLoading] = useState(true);

    const [openSudokuSnackBar, setOpenSudokuSnackBar] = useState<boolean>(false);
    const [sudokuSnackBarMsg, setSudokuSnackBarMsg] = useState<string>("");

    // Aleo
    const [aleoPrivateKey, setAleoPrivateKey] = useState<string>("APrivateKey1zkp8Farwtxy5RuDmcYWin5daBfNGsfnhoEw4oajC8Ad2r4p");
    const [openAleoDialog, setOpenAleoDialog] = useState<boolean>(false);
    const [isWaitingForAleoResponse, setIsWaitingForAleoResponse] = useState(false);
    const [aleoResponse, setAleoResponse] = useState("");

    // Noir
    const [openNoirDialog, setOpenNoirDialog] = useState<boolean>(false);
    const [isWaitingForNoirResponse, setIsWaitingForNoirResponse] = useState(false);
    const [noirResponse, setNoirResponse] = useState("");

    useEffect(() => {
        async function init() {
            await getNewSudoku();
            setIsLoading(false);
        }
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function getNewSudoku() {
        const response = await fetch(`http://127.0.0.1:${ExpressBackendPort}/sudoku`);
        const { puzzle, solution } = await response.json();
        const newSudokuArray: string[][] = [];
        const newSolutionArray: string[][] = [];
        for (let i = 0; i < 9; i++) {
            newSudokuArray.push([]);
            newSolutionArray.push([]);
            for (let j = 0; j < 9; j++) {
                if (puzzle[i][j] === 0) {
                    newSudokuArray[i].push("");
                } else {
                    newSudokuArray[i].push(puzzle[i][j].toString());
                }
                newSolutionArray[i].push(solution[i][j].toString());
            }
        }
        setPuzzleArray(puzzle);
        setSudokuArray(newSudokuArray);
        setSolutionArray(newSolutionArray);
    }

    const handleInput = (r: number, c: number, newValue: any) => {
        sudokuArray[r][c] = newValue;
        setSudokuArray(sudokuArray);
    }

    const validateSolution = () => {
        let isValid = true;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (sudokuArray[i][j] !== solutionArray[i][j]) {
                    isValid = false;
                }
            }
        }
        if (isValid) {
            setSudokuSnackBarMsg("Correct!");
        } else {
            setSudokuSnackBarMsg("Incorrect!");
        }
        setOpenSudokuSnackBar(true);
    }

    const fillInSolution = () => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                (document.getElementById(`sudoku-${i}${j}`)! as HTMLInputElement).value = solutionArray[i][j];
                sudokuArray[i][j] = solutionArray[i][j];
            }
        }
        setSudokuArray(sudokuArray);
    }

    const getUserSolutionArray = () => {
        const userSolutionArray: number[][] = [];
        for (let i = 0; i < 9; i++) {
            userSolutionArray.push([]);
            for (let j = 0; j < 9; j++) {
                if (sudokuArray[i][j] !== "") {
                    userSolutionArray[i].push(parseInt(sudokuArray[i][j]));
                } else {
                    userSolutionArray[i].push(0);
                }
            }
        }
        return userSolutionArray;
    }

    const submitToAleo = async () => {
        setOpenAleoDialog(true);
        setIsWaitingForAleoResponse(true);
        try {
            const response = await fetchWithTimeout(`http://127.0.0.1:${ExpressBackendPort}/aleo/sudoku`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "puzzle": puzzleArray, "solution": getUserSolutionArray(), "private_key": aleoPrivateKey }),
                timeout: 2400000 // 4 minute
            });
            const responseData = await response.json();
            setAleoResponse(responseData["output"]);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setAleoResponse("Request timed out!");
            }
        }
        setIsWaitingForAleoResponse(false);
    }

    const handleCloseAleoDialog = () => {
        setOpenAleoDialog(false);
    }

    const handleCloseNoirDialog = () => {
        setOpenNoirDialog(false);
    }

    const submitToNoir = async () => {
        setIsWaitingForNoirResponse(true);
        setOpenNoirDialog(true);
        let proof = [];
        try {
            const response = await fetchWithTimeout(`http://127.0.0.1:${ExpressBackendPort}/noir/sudoku/proof`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "puzzle": puzzleArray, "solution": getUserSolutionArray() }),
                timeout: 240000 // 4 minute
            });
            const responseData = await response.json();
            console.log(responseData);
            proof = responseData["proof"];
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setAleoResponse("Request timed out!");
            }
            return
        }
        // Proof is of type number[]
        const bytes = Buffer.from(proof);
        console.log(bytes);

        const provider = new ethers.BrowserProvider(window.ethereum!);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const sudokuVerifier = new ethers.Contract(SudoKuVerifierNoirContractAddress, SudokuVerifierABI["abi"], signer);
        try {
            const result = await sudokuVerifier.verify(bytes);
            console.log(result);
            setNoirResponse(result.toString());
        } catch (error: any) {
            console.log(error);
            setNoirResponse(error.toString());
        }
        setIsWaitingForNoirResponse(false);
    }

    const mintNFT = async () => {
        setIsWaitingForNoirResponse(true);
        setOpenNoirDialog(true);
        let proof = [];
        try {
            const response = await fetchWithTimeout(`http://127.0.0.1:${ExpressBackendPort}/noir/sudoku/proof`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "puzzle": puzzleArray, "solution": getUserSolutionArray() }),
                timeout: 240000 // 4 minute
            });
            const responseData = await response.json();
            console.log(responseData);
            proof = responseData["proof"];
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setAleoResponse("Request timed out!");
            }
            return
        }
        // Proof is of type number[]
        const bytes = Buffer.from(proof);
        console.log(bytes);

        const provider = new ethers.BrowserProvider(window.ethereum!);
        const address = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const ZK_NFT = new ethers.Contract(ZK_NFT_ContractAddress, ZK_NFT_ABI["abi"], signer);
        try {
            const result = await ZK_NFT.mintSudokuNFT(address[0], "some uri", bytes);
            console.log(result);
            setNoirResponse(JSON.stringify(result));
        } catch (error: any) {
            console.log(error);
            setNoirResponse(error.toString());
        }
        setIsWaitingForNoirResponse(false);
    }

    return <Paper
        sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            marginX: 8,
        }}
    >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Grid container>
                <Grid item xs={6} >
                    {
                        isLoading ? <Stack alignItems="center">
                            <CircularProgress />
                        </Stack> : <table id="sudoku">
                            <tbody>
                                {
                                    [0, 1, 2, 3, 4, 5, 6, 7, 8].map((r) =>
                                        <tr>
                                            <td><input type="text" id={`sudoku-${r}0`} defaultValue={sudokuArray[r][0]} onChange={(event) => handleInput(r, 0, event.target.value)} /></td>
                                            <td><input type="text" id={`sudoku-${r}1`} defaultValue={sudokuArray[r][1]} onChange={(event) => handleInput(r, 1, event.target.value)} /></td>
                                            <td><input type="text" id={`sudoku-${r}2`} defaultValue={sudokuArray[r][2]} onChange={(event) => handleInput(r, 2, event.target.value)} /></td>
                                            <td><input type="text" id={`sudoku-${r}3`} defaultValue={sudokuArray[r][3]} onChange={(event) => handleInput(r, 3, event.target.value)} /></td>
                                            <td><input type="text" id={`sudoku-${r}4`} defaultValue={sudokuArray[r][4]} onChange={(event) => handleInput(r, 4, event.target.value)} /></td>
                                            <td><input type="text" id={`sudoku-${r}5`} defaultValue={sudokuArray[r][5]} onChange={(event) => handleInput(r, 5, event.target.value)} /></td>
                                            <td><input type="text" id={`sudoku-${r}6`} defaultValue={sudokuArray[r][6]} onChange={(event) => handleInput(r, 6, event.target.value)} /></td>
                                            <td><input type="text" id={`sudoku-${r}7`} defaultValue={sudokuArray[r][7]} onChange={(event) => handleInput(r, 7, event.target.value)} /></td>
                                            <td><input type="text" id={`sudoku-${r}8`} defaultValue={sudokuArray[r][8]} onChange={(event) => handleInput(r, 8, event.target.value)} /></td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    }

                </Grid>
                <Grid item xs={6} style={{ marginTop: 10 }}>
                    <Grid container spacing={5}>
                        <Grid item xs={12} >
                            <Button variant="contained" onClick={() => window.location.reload()}> New Game </Button>
                            <Button variant="contained" onClick={validateSolution} sx={{ marginLeft: 3 }}> Validate Solution</Button>
                            <Button variant="contained" onClick={fillInSolution} sx={{ marginLeft: 3 }} > Fill In Solution</Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="error" onClick={submitToAleo} sx={{ marginRight: 3 }}> Verify with Aleo </Button>
                            <TextField label="Aleo Private Key" variant="standard" value={aleoPrivateKey} sx={{ width: 500 }} onChange={(newValue) => setAleoPrivateKey(newValue.target.value)}></TextField>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="success" onClick={submitToNoir}> Verify with Noir </Button>
                        </Grid>
                        <Grid item xs={2}>
                            <Button variant="contained" color="success" onClick={mintNFT}> Mint NFT </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>

        <Dialog
            open={openAleoDialog}
            onClose={handleCloseAleoDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {isWaitingForAleoResponse ? "Your request has been received!" : "snarkOS response: "}
            </DialogTitle>
            <DialogContent>
                {
                    isWaitingForAleoResponse ? <React.Fragment>
                        <DialogContentText>
                            Please wait for up to 3 minutes before the verification completes.
                        </DialogContentText>
                        <Stack alignItems="center">
                            <CircularProgress />
                        </Stack>
                    </React.Fragment> :
                        <DialogContentText>
                            {aleoResponse}
                        </DialogContentText>
                }
            </DialogContent>
            <DialogActions>
                {
                    !isWaitingForAleoResponse && <Button onClick={handleCloseAleoDialog} autoFocus>
                        OK
                    </Button>
                }
            </DialogActions>
        </Dialog>

        <Dialog
            open={openNoirDialog}
            onClose={handleCloseNoirDialog}
        >
            <DialogTitle id="alert-dialog-title">
                {isWaitingForNoirResponse ? "Your request has been received!" : "Smart contract response: "}
            </DialogTitle>
            <DialogContent>
                {
                    isWaitingForNoirResponse ? <React.Fragment>
                        <DialogContentText>
                            Please wait for up to 20 seconds before the verification completes.
                        </DialogContentText>
                        <Stack alignItems="center">
                            <CircularProgress />
                        </Stack>
                    </React.Fragment> :
                        <DialogContentText>
                            {noirResponse}
                        </DialogContentText>
                }
            </DialogContent>
            <DialogActions>
                {
                    !isWaitingForNoirResponse && <Button onClick={handleCloseNoirDialog} autoFocus>
                        OK
                    </Button>
                }

            </DialogActions>
        </Dialog>

        <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={openSudokuSnackBar}
            onClose={() => setOpenSudokuSnackBar(false)}
            message={sudokuSnackBarMsg}
        />
    </Paper>
}