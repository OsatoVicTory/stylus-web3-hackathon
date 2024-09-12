import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { BsFillSendFill } from 'react-icons/bs';
import { FaArrowDown } from 'react-icons/fa';
import { MdOutlineArrowBack } from 'react-icons/md';
import nodatajpg from './no data.jpg';
import './activity.css';
import { setMessageFn } from "./helpers";


const NoActivity = () => {
    return (
        <div className="no-activity">
            <img src={nodatajpg} alt='no data' />
            <span>No recent activity</span>
        </div>
    );
};

const ActivityList = ({ val, isMobile }) => {

    const [action, amount, from_or_to, address, time] = val.split(' ');
    function parseDate() {
        return String(new Date(parseInt(time))).slice(4, 21);
    };
    function parseAddress(addy) {
        if(!isMobile) return addy;
        return addy.slice(0, 10) + '...' + addy.slice(-6);
    };

    return (
        <div className="activity-li-">
            <div className="acl-img">
                {action === 'Sent' ? 
                    <BsFillSendFill className="acl-icon" /> :
                    <FaArrowDown className="acl-icon" />
                }
            </div>
            <div className="acl-txt">
                <span className="acl-action">{action+' '} wETH</span>
                <span className="acl-sml">{`${from_or_to} ${parseAddress(address)}`}</span>
            </div>
            <div className="acl-desc">
                <span className="acl-amt">{amount+' '} wETH</span>
                <span className="acl-sml">{parseDate()}</span>
            </div>
        </div>
    );
};

const Activity = ({ user, activity, setActivity, setMessage, contract }) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activityLists, setActivityLists] = useState(activity);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 550);
    const navigate = useNavigate();

    async function getActivities() {
        setLoading(true);
        if(!user) {
            setMessageFn(setMessage, 'Connect Wallet!');
            return navigate('/');
        };

        try {
            const resp = await contract.getActivities(user);
            const res = Array.from(resp);
            setActivityLists(res);
            setActivity(res);
            setLoading(false);
        } catch(error) {
            console.log('error fetcing activities', error);
            setError(true);
            setLoading(false);
            setMessageFn(setMessage, 'Error loading. Check Internet');
        }
    };

    useEffect(() => {

        getActivities();
        const resize = () => setIsMobile(window.innerWidth <= 550);
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    return (
        <div className="activity">
            {error && < div className="error">
                <div className="error-retry cursor" onClick={() => getActivities()}>Retry</div>
            </div>}
            <div className='activity-header'>
                <MdOutlineArrowBack className='activity-header-icon cursor' onClick={()=>navigate(-1)} />
                <h2>Recent Activity</h2>
            </div>
            <div className="activity-content">
                {loading && <div className="loading"><div className="loading-absolute"></div></div>}
                {activityLists.length === 0 ? 
                    <NoActivity /> :
                    <ul className="activity-lists">
                        {activityLists.reverse().map((val, idx) => (
                            <li className="activity-li" key={`al-${idx}`}>
                                <ActivityList val={val} isMobile={isMobile} />
                            </li>
                        ))}
                    </ul>
                }
            </div>
        </div>
    );
};

export default Activity;