import { useState } from 'react';
import { Contract, BrowserProvider } from "ethers";
import { Routes, Route } from 'react-router-dom';
import abi from './contractABI.json';
import './App.css';
import Activity from './activity';
import AppHome from './home';
import Transfer from './transfer';
import { setMessageFn, shorten, Tasks, orgTasks } from './helpers';

function App() {
  const [user, setUser] = useState('');
  const [points, setPoints] = useState(0);
  const [contract, setContract] = useState({});
  const [signer, setSigner] = useState('');
  const [message, setMessage] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [activity, setActivity] = useState([]);
  const [tasks, setTasks]  =  useState(Tasks);

  const div = (val) => {
    const res = ''+val;
    return (res.slice(0, res.length - 18)) - 0;
  };

  async function loadContract() {
    // const contractAddress = "0xc84b0f61ee0b01a35eefabc5f705feaf313297c7";
    const contractAddress = "0xe0879d3a84746576432c27565f4f2b9daf3e6abf";
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
    // console.log(userPoints, userTasks);
    setSigner(signer);
    setContract(contractInstance);
    setUser(signerAddress);
    setPoints(div(userPoints.toString())||0);
    setTasks(orgTasks(userTasks, tasks));
    setMessageFn(setMessage, 'Welcome '+signerAddress);
    setConnecting(false);
  };


  function connectWallet() {
    if(user) return setMessageFn(setMessage, 'Wallet active, refresh page to connect new wallet');
    
    if (!window.ethereum) return setMessageFn(setMessage, 'Install Metamask extension!');

    loadContract().catch(error => {
      console.error('Error connecting wallet', error);
      setMessageFn(setMessage, 'Error connecting wallet');
      setConnecting(false);
    });
  };

  return (
    <div className="App">
      <div className='app'>
        <div className={`message ${message ? true : false}`}>{message}</div>
        <header>
          <h2>Earn Points</h2>
          <div className='wallet cursor' onClick={()=>connectWallet()}>
            {connecting ? 'Connecting...' : shorten(user)||'Connect wallet'}
          </div>
        </header>
        <main>

          <Routes>
            <Route 
              path='/' 
              element={<AppHome tasks={tasks} setTasks={setTasks} setPoints={setPoints} 
              contract={contract} setMessage={setMessage} user={user} points={points} />} 
            />
            <Route
              path='/transfer'
              element={<Transfer user={user} points={points} setMessage={setMessage} 
              contract={contract} setPoints={setPoints} />}
            />
            <Route 
              path='/activities'
              element={<Activity activity={activity} setActivity={setActivity} 
              setMessage={setMessage} contract={contract} user={user} />}
            />
          </Routes>

        </main>
      </div>
    </div>
  );
}

export default App;
