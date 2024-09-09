import { useState, useEffect } from 'react';
import { Contract, BrowserProvider, parseUnits } from "ethers";
import abi from './contractABI.json';
// import { Contract, JsonRpcProvider, parseUnits } from 'ethers';
import './App.css';
import x from './x logo.jpg';
import tg from './telegram logo.jpg';
import logo from './dapps logo.jpg';

function App() {
  const [user, setUser] = useState('');
  const [points, setPoints] = useState(0);
  const [contract, setContract] = useState({});
  const [signer, setSigner] = useState('');
  const [message, setMessage] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const Tasks = [
    {name:'Join Telegram', point:500, task: 'https://t.me/+JGur_ErNHq44MTM8', img: tg, task_id: 'tg1'},
    {name:'Follow on X', point:500, task: 'https://x.com/dappsoverapps?t=l_YhagW_N3dKAMFJKhnRyw&s=08', img: x, task_id: 'x1'},
    {name:'Enter Hackathon', point:1000, task: 'https://dorahacks.io/hackathon/dappsoverapps/hackers', img: logo, task_id: 'hack1'},
  ];
  const [tasks, setTasks]  =  useState([
    {name:'Join Telegram', point:500, task: 'https://t.me/+JGur_ErNHq44MTM8', img: tg, completed: false, task_id: 'tg1'},
    {name:'Follow on X', point:500, task: 'https://x.com/dappsoverapps?t=l_YhagW_N3dKAMFJKhnRyw&s=08', img: x, completed: false, task_id: 'x1'},
    {name:'Enter Hackathon', point:1000, task: 'https://dorahacks.io/hackathon/dappsoverapps/hackers', img: logo, completed: false, task_id: 'hack1'},
  ]);

  function orgTasks(array) {
    const arr = Array.from(array);
    console.log('arr', arr);
    const uncompleted = tasks.filter((val, idx) => !arr.includes(val.task_id));
    const completed = tasks.filter((val, idx) => arr.includes(val.task_id));
    return [
      ...uncompleted.map(val => ({ ...val, completed: false })), 
      ...completed.map(val => ({ ...val, completed: true }))
    ];
  };

  
  async function loadContract() {
    // const contractAddress = "0xc84b0f61ee0b01a35eefabc5f705feaf313297c7";
    const contractAddress = "0x5da553c0a35308c1d483c6d3f58a1aa2b1a11eff";
    // Ensure window.ethereum is available
    if (!window.ethereum) {
      throw new Error("No crypto wallet found. Please install MetaMask.");
    }
    setConnecting(true);
    const provider = await new BrowserProvider(window.ethereum);
    const signer_val = await provider.getSigner();
    const signerAddress = await signer_val.getAddress();
    const contractInstance = await new Contract(contractAddress, abi, signer_val);
    const userPoints = await contractInstance.getPoints(signerAddress);
    const userTasks = await contractInstance.getTasks(signerAddress);
    console.log(signerAddress, contractInstance, userPoints, userTasks);
    setSigner(signer);
    setContract(contractInstance);
    setUser(signerAddress);
    setPoints(parseInt(userPoints.toString()));
    setTasks(orgTasks(userTasks));
    setMessage('Welcome '+signerAddress);
    setConnecting(false);
    setTimeout(() => { setMessage(''); }, 1500);
  };


  const handleClick = async (val) => {
    if(val.completed) return;
    if (contract && user) {
      try {
        setCompleting(val.task_id);
        // Increment user points on the blockchain
        const tx = await contract.completeTask(user, parseUnits(''+val.point, 18), val.task_id);
        await tx.wait(); // Wait for transaction to be mined
        const arr = [val.task_id, ...tasks.filter((vall, idx) => vall.completed).map(vale => vale.task_id)];
        setPoints(points + val.point);
        setTasks(orgTasks(arr));
        setMessage('Task Completed!');
        setTimeout(() => { setMessage(''); }, 1500);
        setCompleting(false);
      } catch (error) {
        console.error('Error incrementing points:', error);
        setMessage('Error completing task');
        setCompleting(false);
        setTimeout(() => { setMessage(''); }, 1500);
      }
    }
  };

  function shorten(val) {
    if(!val) return val;
    return val.slice(0, 6) + '...' + val.slice(-3);
  };

  function connectWallet() {
    if (!window.ethereum) {
      setMessage('Install Metamask extension!');
      setTimeout(() => { setMessage(''); }, 1500);
      return;
    }

    loadContract().catch(error => {
      console.error('Error connecting wallet', error);
      setMessage('Error connecting wallet');
      setConnecting(false);
      setTimeout(() => { setMessage(''); }, 1500);
    });
  };

  return (
    <div className="App">
      <div className='app'>
        {message && <div className='message'>{message}</div>}
        <header>
          <h2>Earn Points</h2>
          <div className='wallet cursor' onClick={()=>connectWallet()}>
            {connecting ? 'Connecting...' : shorten(user)||'Connect wallet'}
          </div>
        </header>
        <main>
          <div className='user'>
            <h3>User: {user||'Connect wallet'}</h3>
          </div>
          {user && <div className='connected'>
            <h3>Your Points: {points}</h3>
            <div className='app-main'>
              <ul className='app-ul'>
                {tasks.map((val, idx) => (
                  <li className='app-li' key={`li-${idx}`}>
                    <div className='li-img'>
                      <img src={val.img} alt='logo' />
                    </div>
                    <div className='li-txt'>
                      <span className='txt-big'>{val.name}</span>
                      <span className='txt-small'>+{val.point} points</span>
                    </div>
                    {completing === val.task_id ?
                      <div className='task-btn'>Completing...</div> : 
                      !val.completed ? 
                      <a href={val.task} target='_blank' className='task-btn' onClick={() => handleClick(val)}>Start</a> :
                      <div className='task-done'>Done</div> 
                    }
                  </li>
                ))}
              </ul>
            </div>
          </div>}
        </main>
      </div>
    </div>
  );
}

export default App;
