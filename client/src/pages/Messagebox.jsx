

function MessageSystem() {


    const userlists = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    lastSeen: "Online",
    unread: 2,
    online: true,
    typing: false,
    lastMessage: "Hey! How are you?",
    timestamp: "10:30 AM"
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    lastSeen: "Last seen 5 min ago",
    unread: 0,
    online: false,
    typing: false,
    lastMessage: "The meeting is at 3 PM",
    timestamp: "09:45 AM"
  },
  {
    id: 3,
    name: "Emma Watson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    lastSeen: "Online",
    unread: 5,
    online: true,
    typing: true,
    lastMessage: "Typing...",
    timestamp: "09:20 AM"
  },
  {
    id: 4,
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    lastSeen: "Last seen 1 hour ago",
    unread: 0,
    online: false,
    typing: false,
    lastMessage: "Thanks for your help!",
    timestamp: "Yesterday"
  },
  {
    id: 5,
    name: "Lisa Anderson",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    lastSeen: "Online",
    unread: 1,
    online: true,
    typing: false,
    lastMessage: "See you tomorrow 👋",
    timestamp: "Yesterday"
  }
];

  return (
    <div>
        <div className="flex ">
            <div className="w-100 bg-blue-100 mx-3 my-2 px-3 py-2">
              <div>users</div>

        {userlists.map((users)=>(
<div key={users.id} className="flex gap-2 py-3 items-center">
           
                <img className="h-10 w-10 rounded-full" src={users.avatar} alt="" />
           
          <div className=" leading-3">
            <span className="font-medium ">{users.name}</span><br/>
            <span className="text-xs font-sans">{users.lastSeen}</span>
        </div>
        </div>
        ))}
       
        
            </div>



            <div className="w-200">
sada
            </div>

        </div>
       

         
        
    </div>
  )
}

export default MessageSystem