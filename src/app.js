require('dotenv').config({path: './config/dev.env'})
const express = require('express');
const path = require('path');
const userRouter = require('./routers/user.js');
const chatRouter = require('./routers/chat.js');
const http = require('http');
const Chat = require('./models/chat.js');
const User = require('./models/user.js')
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Object to track userId to socket mapping
const userSocketMap = {};

app.use(express.json());
app.use(userRouter);
app.use(chatRouter);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

app.get('/', (req, res) => {
  res.sendFile('signup.html', { root: publicDirectoryPath });
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: publicDirectoryPath });
});

app.get('/home', (req, res) => {
  res.sendFile('home.html', { root: publicDirectoryPath });
});

app.get('/profile', (req, res) => {
  res.sendFile('profile.html', { root: publicDirectoryPath });
})

const onlineUsers = new Set()

io.on('connection', (socket) => {
  console.log('New web socket connection');

  // Event to track which user is connected
  socket.on('register', (userId) => {
    userSocketMap[userId] = socket.id;
    onlineUsers.add(userId);
    console.log(`User ${userId} connected`);
    io.emit('onlineUsers', Array.from(onlineUsers));
  });

  socket.on('fetchLastSeen', async ({userId}) => {
    const user = await User.findById(userId)
    if (Array.from(onlineUsers).includes(userId)) {
      socket.emit('lastSeen', { lastSeen: 'Online' });
    } else if (user && user.lastSeen) {
      socket.emit('lastSeen', { lastSeen: user.lastSeen });
    }
  })


  // Handle incoming messages
  socket.on('message', async (message) => {
    try {
      const chatMessage = new Chat({
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        status: 'sent'
      });
  
      const savedMessage = await chatMessage.save();
      console.log(savedMessage)

      // Find the receiver's socket ID
      const receiverSocketId = userSocketMap[message.receiverId]; 
      
      if (receiverSocketId) {
        // Emit the message to the receiver's socket
        io.to(receiverSocketId).emit('displayMessage', savedMessage);
      } else {
        console.log(`No active connection for user ${message.receiverId}`);
      }
  
      
    } catch (error) {
      console.log({error: error.message})
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        io.emit('onlineUsers', Array.from(onlineUsers));
        const user = await User.findByIdAndUpdate(userId, { lastSeen: new Date() })
        await user.save()
        break;
      }
    }
  });

});

server.listen(process.env.PORT, () => {
  console.log('Server is up on port 3000');
});
