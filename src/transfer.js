import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseUnits } from "ethers";
import { setMessageFn } from './helpers';
import { MdOutlineArrowBack } from 'react-icons/md';
import './App.css';

const Transfer = ({ user, setMessage, points, setPoints, contract }) => {

    const [details, setDetails] = useState({});
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setDetails({ ...details, [name]: value });
    };

    const sendFunds = async () => {
        if(!user) return setMessageFn(setMessage, 'Connect Wallet!');
        setSending(true);
        const { address, amount } = details;
        if(points < amount) return setMessageFn(setMessage, 'You do no have enough amount');
        try {
            const tx = await contract.transferToken(
                user, address, parseUnits(''+amount, 18), 
                `Sent ${amount} to ${address} ${new Date().getTime()}`,
                `Received ${amount} from ${user} ${new Date().getTime()}`
            );
            await tx.wait(); // Wait for transaction to be mined
            setPoints(points - amount);
            setMessageFn(setMessage, 'Funds transferred successfully');
            setSending(false);
            navigate(-1);
        } catch(error) {
            setSending(false);
        }
    };

    return (
        <div className="transfer">
            <div className='user'><h3>User: {user}</h3></div>
            <div className='t-header'>
                <MdOutlineArrowBack className='t-header-icon cursor' onClick={()=>navigate(-1)} />
                <h2>Transfer to wallet</h2>
            </div>
            <div className='transfer-main'>
                <div className="transfer-field">
                    <span>Receiver Address</span>
                    <input placeholder="Enter address" name='address' onChange={handleChange} />
                </div>
                <div className="transfer-field">
                    <span>Amount to send</span>
                    <input placeholder="Enter amount" name='amount' type='number' onChange={handleChange} />
                </div>
            </div>
            <div className='send'>
                <div className='send-btn cursor' onClick={sendFunds}>
                    {sending ? 'Sending...' : 'Send'}
                </div>
            </div>
        </div>
    );
};

export default Transfer;