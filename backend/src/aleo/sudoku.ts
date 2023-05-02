import express, { Router, Request, Response } from "express";
import util from "util";
import { convertSudokuBoardToAleoPuzzleInfo } from "../utils/sudoku";
const exec = util.promisify(require('child_process').exec);

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    console.log(`${req.originalUrl} called with ${JSON.stringify(req.body)}`);
    if (req.body.private_key === "" || req.body.private_key == null) {
        res.json({ error: "Player private_key is required" });
        return;
    }

    if (req.body.puzzle === "" || req.body.puzzle == null) {
        res.json({ error: "Puzzle is required" });
        return;
    }

    if (req.body.solution === "" || req.body.solution == null) {
        res.json({ error: "Solution is required" });
        return;
    }
    const awsInstance = process.env.AWS_INSTANCE; // IP address of EC2 Prover
    // add pem file to backend/
    console.log(req.body, "REQUEST BODY....");
    console.log("--------");
    console.log("sshing and executing.....");

    // TODO: Figure out why this does not work consistently.
    // TODO: Record input is a real hassle as well, needs to be automated
    const cmd = `ssh -i "aleo.pem" ${awsInstance} "sudo su && cd /home/ubuntu/Zero-Knowledge-Sudoku-Wordle-Trivia/aleo/sudoku && snarkos developer execute sudoku.aleo solve_puzzle '${convertSudokuBoardToAleoPuzzleInfo(
        req.body.puzzle
    )}' '${convertSudokuBoardToAleoPuzzleInfo(
        req.body.solution
    )}' --private-key '${
        req.body.private_key
    }' --query 'http://localhost:3030' --broadcast 'http://localhost:3030/testnet3/transaction/broadcast' --fee 66666666 -r '{  owner: aleo1qzy48773u0pk838kjlkgqs6a75al6pl9a2p3w63txtpswtnc2uxsv2qk88.private,  microcredits: 999333333334u64.private,  _nonce: 5474294092883742609504206757573024173252015534887734748072809411954213003081group.public}'"`;

    // await exec(cmd, (err, stdout, stderr) => {
    //     if (err) throw err;
    //     process.stdout.write(stdout);
    //     res.json({ output: stdout });
    // });
    console.log("command has been executed....");
    // console.log(`stdout: ${stdout}`);
    // console.log(`stderr: ${stderr}`);
    console.log("result is here....");
    console.log("---------");
    console.log(cmd);
    console.log("---------");

    const { stdout, stderr } = await exec(cmd);
    console.log("command has been executed....");
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    console.log("result is here....");

    res.json({ output: stdout });
});

export default router;


// ssh -i "aleo.pem" ubuntu@ec2-54-91-208-198.compute-1.amazonaws.com "sudo su && cd /home/ubuntu/Zero-Knowledge-Sudoku-Wordle-Trivia/aleo/sudoku && snarkos developer execute sudoku.aleo solve_puzzle '{ row1: {n1: 0u8,n2: 0u8,n3: 0u8,n4: 0u8,n5: 5u8,n6: 0u8,n7: 0u8,n8: 0u8,n9: 7u8}, row2: {n1: 3u8,n2: 0u8,n3: 6u8,n4: 0u8,n5: 0u8,n6: 8u8,n7: 0u8,n8: 0u8,n9: 0u8}, row3: {n1: 0u8,n2: 0u8,n3: 0u8,n4: 6u8,n5: 2u8,n6: 0u8,n7: 1u8,n8: 3u8,n9: 0u8}, row4: {n1: 0u8,n2: 4u8,n3: 0u8,n4: 0u8,n5: 3u8,n6: 0u8,n7: 0u8,n8: 0u8,n9: 9u8}, row5: {n1: 7u8,n2: 5u8,n3: 0u8,n4: 0u8,n5: 0u8,n6: 6u8,n7: 0u8,n8: 0u8,n9: 2u8}, row6: {n1: 0u8,n2: 0u8,n3: 0u8,n4: 7u8,n5: 1u8,n6: 0u8,n7: 0u8,n8: 0u8,n9: 3u8}, row7: {n1: 2u8,n2: 8u8,n3: 0u8,n4: 0u8,n5: 0u8,n6: 5u8,n7: 0u8,n8: 0u8,n9: 0u8}, row8: {n1: 0u8,n2: 0u8,n3: 4u8,n4: 0u8,n5: 7u8,n6: 0u8,n7: 9u8,n8: 2u8,n9: 6u8}, row9: {n1: 1u8,n2: 0u8,n3: 0u8,n4: 0u8,n5: 9u8,n6: 3u8,n7: 0u8,n8: 0u8,n9: 0u8}}' '{ row1: {n1: 0u8,n2: 0u8,n3: 0u8,n4: 0u8,n5: 5u8,n6: 0u8,n7: 0u8,n8: 0u8,n9: 7u8}, row2: {n1: 3u8,n2: 0u8,n3: 6u8,n4: 0u8,n5: 0u8,n6: 8u8,n7: 0u8,n8: 0u8,n9: 0u8}, row3: {n1: 0u8,n2: 0u8,n3: 0u8,n4: 6u8,n5: 2u8,n6: 0u8,n7: 1u8,n8: 3u8,n9: 0u8}, row4: {n1: 0u8,n2: 4u8,n3: 0u8,n4: 0u8,n5: 3u8,n6: 0u8,n7: 0u8,n8: 0u8,n9: 9u8}, row5: {n1: 7u8,n2: 5u8,n3: 0u8,n4: 0u8,n5: 0u8,n6: 6u8,n7: 0u8,n8: 0u8,n9: 2u8}, row6: {n1: 0u8,n2: 0u8,n3: 0u8,n4: 7u8,n5: 1u8,n6: 0u8,n7: 0u8,n8: 0u8,n9: 3u8}, row7: {n1: 2u8,n2: 8u8,n3: 0u8,n4: 0u8,n5: 0u8,n6: 5u8,n7: 0u8,n8: 0u8,n9: 0u8}, row8: {n1: 0u8,n2: 0u8,n3: 4u8,n4: 0u8,n5: 7u8,n6: 0u8,n7: 9u8,n8: 2u8,n9: 6u8}, row9: {n1: 1u8,n2: 0u8,n3: 0u8,n4: 0u8,n5: 9u8,n6: 3u8,n7: 0u8,n8: 0u8,n9: 0u8}}' --private-key 'APrivateKey1zkp8Farwtxy5RuDmcYWin5daBfNGsfnhoEw4oajC8Ad2r4p' --query 'http://localhost:3030' --broadcast 'http://localhost:3030/testnet3/transaction/broadcast'"