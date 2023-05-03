import express, { Router, Request, Response } from "express";
import util from "util";
import { convertSudokuBoardToAleoPuzzleInfo } from "../utils/sudoku";
import fs from 'fs';
import { Client } from 'ssh2';

const router: Router = express.Router();
const AWS_INSTANCE = process.env.AWS_INSTANCE;
// add pem file to backend/
const AWS_PK = fs.readFileSync("./aleo.pem");

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

    const conn = new Client();
    // TODO: Record input for fee is a real hassle as well, needs to be automated
    // const cmd = `sudo -i -u root bash -c 'cd /home/ubuntu/Zero-Knowledge-Sudoku-Wordle-Trivia/aleo/sudoku && leo build && '`;
    const cmd = `sudo -i -u root bash -c "cd /home/ubuntu/Zero-Knowledge-Sudoku-Wordle-Trivia/aleo/sudoku && leo build && snarkos developer execute sudoku.aleo solve_puzzle '${convertSudokuBoardToAleoPuzzleInfo(
        req.body.puzzle
    )}' '${convertSudokuBoardToAleoPuzzleInfo(
        req.body.solution
    )}' --private-key '${
        req.body.private_key
    }' --query 'http://localhost:3030' --broadcast 'http://localhost:3030/testnet3/transaction/broadcast' --fee 666666666 -r '{owner: aleo1qzy48773u0pk838kjlkgqs6a75al6pl9a2p3w63txtpswtnc2uxsv2qk88.private,  microcredits: 89998333333335u64.private,  _nonce: 4118217333159501364573679418057957278907022026170345524646905446245923988211group.public}'"`;
    console.log(cmd, "COMMAND");
    console.log('---------');
    conn.on("ready", function () {
        conn.exec(cmd, function (err, stream) {
            if (err) throw err;
            stream.on("close", function (code, signal) {
                console.log(`Command '${cmd}' completed with code ${code}`);
                conn.end();
            }).on("data", function (data) {
                console.log("stdout: " + data);
                // Can probably parse successful txn or something
            }).stderr.on("data", function (data) {
                console.error("stderr: " + data);
            });
        });
    }).connect({
        host: AWS_INSTANCE,
        username: "ubuntu", // Replace with your SSH username
        privateKey: AWS_PK,
    });

});

export default router;