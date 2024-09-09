import { ethers } from "ethers";
import { Contract } from "ethers";  // Import Contract directly.
import abi from './contractABI.json';

const contractAddress = "0xc84b0f61ee0b01a35eefabc5f705feaf313297c7";
// Ensure window.ethereum is available
if (!window.ethereum) {
    throw new Error("No crypto wallet found. Please install MetaMask.");
}
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = provider.getSigner();
const contract = new Contract(contractAddress, abi, signer);

export { contract, signer };
