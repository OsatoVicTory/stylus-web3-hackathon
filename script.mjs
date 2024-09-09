import fetch from "node-fetch";
import { ethers } from "ethers";
import fs from "fs/promises"; // Use the promise-based fs API

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text(); // Return raw text instead of JSON
        } catch (error) {
            console.error(`Attempt ${i + 1} failed. ${error.message}`);
            if (i < retries - 1) {
                console.log(`Retrying in ${backoff}ms...`);
                await new Promise(res => setTimeout(res, backoff));
            } else {
                throw new Error(`All ${retries} attempts failed.`);
            }
        }
    }
}


// etherscan api key
// MBEPC8NQI3R2MAB1CK5TP2R2VV1IVZK8AA

// private key
// bf6eb5a34d3658397249d1ce5d1073e7307adc0787dabcb06bf70eff60a57737

// contract address
// 0xc84b0f61ee0b01a35eefabc5f705feaf313297c7

async function main() {
    const etherscanApiKey = "MBEPC8NQI3R2MAB1CK5TP2R2VV1IVZK8AA";
    const contractAddress = "0xc84b0f61ee0b01a35eefabc5f705feaf313297c7";  // Replace with your actual contract address
    const privateKey = "bf6eb5a34d3658397249d1ce5d1073e7307adc0787dabcb06bf70eff60a57737";
    const nodeUrl = "https://sepolia-rollup.arbitrum.io/rpc";

    const abiUrl = `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanApiKey}`;

    try {
        const rawData = await fetchWithRetry(abiUrl);
        console.log("Raw response data:", rawData); // Log the raw response
        const data = JSON.parse(rawData); // Attempt to parse JSON
        const abi = JSON.parse(data.result);

        // Write ABI to a file
        await fs.writeFile('contractABI.json', JSON.stringify(abi, null, 2), 'utf8');
        console.log("ABI has been written to contractABI.json");

        const provider = new ethers.JsonRpcProvider(nodeUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(contractAddress, abi, wallet);

        console.log("Connected to contract:", contractAddress);
        console.log("Using wallet address:", wallet.address);

        // Additional code for interacting with the contract...

    } catch (error) {
        console.error("Failed to fetch ABI:", error);
    }
}

main().catch(error => {
    console.error("Error:", error);
});