/* eslint-disable react/jsx-key */
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import Contact from "./Contact";

export default function Chat() {

  // eslint-disable-next-line no-unused-vars
  const [ws,setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople,setOfflinePeople] = useState({});
  const [selectedUserId,setSelectedUserId] = useState(null);
  const [newMessageText,setNewMessageText] = useState('');
  const [messages,setMessages] = useState([]);

  useEffect( () => {
    const ws = new WebSocket('ws://localhost:4000');
    setWs(ws);
    ws.addEventListener('message', handleMessage)
  }, []);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage (ev) {
    const messageData = JSON.parse(ev.data);
    console.log(ev,messageData);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    } else if ('text' in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages(prev => ([...prev, {...messageData}]));
      }
    } 
  }


  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3">
        <div className="text-blue-600 font-bold flex gap-1 p-4 text-3xl">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
          </svg>

          ChatU
        </div>
        {Object.keys(onlinePeople).map(userId => (
         <div onClick={() => setSelectedUserId(userId)}
          className={"border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer "+(userId === selectedUserId ? 'bg-blue-50': '')}> 
          <Avatar username={onlinePeople[userId]} userId={userId}/>
          <span className="text-gray-700">{onlinePeople[userId]}</span>
            
          </div>
        ))}
      </div>
      <div className="bg-blue-100 flex flex-col w-2/3 p-2">
       <div className="flex-grow">
        message with selected person
       </div>
       <div className="flex gap-2">
        <input type="text" placeholder="Type your message here" className="bg-white border flex-grow p-2 rounded-md"/>
        <button className="bg-blue-500 p-2 text-white rounded-md">
          
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>

        </button>
        </div> 
      </div>
    </div>
  );
}