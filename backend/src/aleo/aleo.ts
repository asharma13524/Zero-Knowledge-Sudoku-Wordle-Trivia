import express, { Router, Request, Response } from "express";
import fetch from 'cross-fetch';
import util from "util";
import { Client } from 'ssh2';
import fs from 'fs';

const router: Router = express.Router();
const AWS_INSTANCE = process.env.AWS_INSTANCE;
// add pem file to backend/
const AWS_PK = fs.readFileSync('./aleo.pem');

router.get('/transaction/:transaction_id', async (req: Request, res: Response) => {
    console.log(`${req.originalUrl} called`);
    try {
        const execution_id_get_response = await fetch(`http://0.0.0.0:3030/testnet3/transaction/${req.params.transaction_id}`);
        res.json(await execution_id_get_response.json());
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

router.post('/decrypt', async (req: Request, res: Response) => {
    console.log(`${req.originalUrl} called with ${JSON.stringify(req.body)}`);
    if (req.body.view_key === "" || req.body.view_key == null) {
        res.json({ error: "View key is required" });
        return
    }
    if (req.body.ciphertext === "" || req.body.ciphertext == null) {
        res.json({ error: "Ciphertext is required" });
        return
    }
    const cmd = `snarkos developer decrypt -v ${req.body.view_key} -c ${req.body.ciphertext}`;
    console.log(cmd);
    const { stdout, stderr } = await exec(cmd);
    res.json({ "output": stdout });
});

router.post("/transfer", async (req: Request, res: Response) => {
    console.log(`${req.originalUrl} called with ${JSON.stringify(req.body)}`);
    console.log(req.body);
    if (req.body.aleo_address === "" || req.body.aleo_address == null) {
        res.json({ error: "aleo address is required" });
        return;
    }

    if (req.body.private_key === "" || req.body.private_key == null) {
        res.json({ error: "private_key is required" });
        return;
    }

    if (req.body.transfer_record === "" || req.body.transfer_record == null) {
        res.json({ error: "transfer_record is required" });
        return;
    }

    if (req.body.transfer_amount === "" || req.body.transfer_amount == null) {
        res.json({ error: "Amount of aleo credits to transfer is required" });
        return;
    }

    if (req.body.fee_record === "" || req.body.fee_record == null) {
        res.json({ error: "fee_record is required" });
        return;
    }

    if (req.body.fee_amount === "" || req.body.fee_amount == null) {
        res.json({ error: "fee_amount is required" });
        return;
    }

    // TODO: Record input is a real hassle as well, needs to be automated
    const conn = new Client();
    const cmd = `sudo -i -u root bash -c 'snarkos developer execute credits.aleo transfer ${req.body.transfer_record} ${req.body.aleo_address} '${req.body.transfer_amount + 'u64'}' --private-key ${
    req.body.private_key
    } --query 'http://localhost:3030' --broadcast 'http://localhost:3030/testnet3/transaction/broadcast' --fee ${req.body.fee_amount} -r ${req.body.fee_record}'`;
    conn.on('ready', function() {
        conn.exec(cmd, function(err, stream) {
            if (err) throw err;
            stream.on('close', function(code, signal) {
                console.log(`Command '${cmd}' completed with code ${code}`);
                conn.end();
            }).on('data', function(data) {
                console.log('stdout: ' + data);
                // Can probably parse successful txn or something
            }).stderr.on('data', function(data) {
                console.error('stderr: ' + data);
            });
        });
    }).connect({
        host: AWS_INSTANCE,
        username: 'ubuntu', // Replace with your SSH username
        privateKey: AWS_PK
    });
});

export default router;