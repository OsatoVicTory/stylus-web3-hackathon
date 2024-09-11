import x from './x logo.jpg';
import tg from './telegram logo.jpg';
import logo from './dapps logo.jpg';

export const Tasks = [
    {name:'Join Telegram', point:500, task: 'https://t.me/+JGur_ErNHq44MTM8', img: tg, 
        completed: false, task_id: 'tg1'},
    {name:'Follow on X', point:500, task: 'https://x.com/dappsoverapps?t=l_YhagW_N3dKAMFJKhnRyw&s=08', img: x, 
        completed: false, task_id: 'x1'},
    {name:'Enter Hackathon', point:1000, task: 'https://dorahacks.io/hackathon/dappsoverapps/hackers', img: logo, 
        completed: false, task_id: 'hack1'},
    {name:'Like Post on X', point:250, task: 'https://x.com/dappsoverapps/status/1832768631907983829?t=dSIYLZF2SaXQh2an51dMWA&s=19', 
      img: x, completed: false, task_id: 'x2'},
];

// tweet id is status/:id

export const orgTasks = (array, tasks) => {
  const arr = Array.from(array);
  const uncompleted = tasks.filter((val, idx) => !arr.includes(val.task_id));
  const completed = tasks.filter((val, idx) => arr.includes(val.task_id));
  return [
    ...uncompleted.map(val => ({ ...val, completed: false })), 
    ...completed.map(val => ({ ...val, completed: true }))
  ];
};

export const setMessageFn = (setMessage, msg) => {
    setMessage(msg);
    setTimeout(() => { setMessage(''); }, 2500);
};

export const shorten = (val) => {
    if(!val) return val;
    return val.slice(0, 6) + '...' + val.slice(-3);
};