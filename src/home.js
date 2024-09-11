import { useState } from 'react';
import { parseUnits } from "ethers";
import { useNavigate } from 'react-router-dom';
import './App.css';
import { orgTasks, setMessageFn } from './helpers';

const AppHome = ({ user, tasks, points, setTasks, setPoints, setMessage, contract }) => {
    const [claiming, setClaiming] = useState(false);
    const [clicked, setClicked] = useState([]);
    const navigate = useNavigate();
    

    const anchorClicked = (val) => {
        setClicked([...clicked, val.task_id]);
    };

    const handleClaim = async (val) => {
      if(claiming) return setMessageFn(setMessage, 'Currently processing a request!');

      if(val.completed) return setMessageFn(setMessage, 'Task completed already!');

      if (contract && user) {
        try {
          setClaiming(val.task_id);
          // Increment user points on the blockchain
          const tx = await contract.completeTask(user, parseUnits(''+val.point, 18), val.task_id);
          await tx.wait(); // Wait for transaction to be mined
          const arr = [val.task_id, ...tasks.filter((vall, idx) => vall.completed).map(vale => vale.task_id)];
          setPoints(points + val.point);
          setTasks(orgTasks(arr, tasks));
          setMessageFn(setMessage, 'Task Completed!');
          setClaiming(false);
          setClicked(clicked.filter(task_id => task_id !== val.task_id));
        } catch (error) {
          console.error('Error incrementing points:', error);
          setMessageFn(setMessage, 'Error completing task');
          setClaiming(false);
        }
      }
    };

    return (
        <div className='home'>
            {!user && <div className='no-user'>
                <h2>No user ? Connect wallet</h2>
            </div>}
            {user && <div className='user'>
                <h3>User: {user}</h3>
                <div>
                    <div className='user-btn cursor' onClick={() => navigate('/transfer')}>Transfer</div>
                    <div className='user-btn b cursor' onClick={() => navigate('/activities')}>Activities</div>
                </div>
            </div>}
            {user && <div className='connected'>
                <h3>Your Claimed tokens: {points} wETH</h3>
                <div className='app-main'>
                    <ul className='app-ul'>
                    {tasks.map((val, idx) => (
                        <li className='app-li' key={`li-${idx}`}>
                        <div className='li-img'>
                            <img src={val.img} alt='logo' />
                        </div>
                        <div className='li-txt'>
                            <span className='txt-big'>{val.name}</span>
                            <span className='txt-small'>+{val.point} wETH</span>
                        </div>
                        {
                            claiming === val.task_id ?
                            <div className='task-btn'>Claiming...</div> : 
                            clicked.includes(val.task_id) ?
                            <div className='task-btn cursor' onClick={() => handleClaim(val)}>Claim</div> :
                            !val.completed ? 
                            <a href={val.task} target='_blank' className='task-btn' onClick={() => anchorClicked(val)}>Start</a> :
                            <div className='task-done'>Done</div> 
                        }
                        </li>
                    ))}
                    </ul>
                </div>
            </div>}
        </div>
    );
};

export default AppHome;