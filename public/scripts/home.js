const socket = io();
import dayjs from 'https://unpkg.com/dayjs@1.11.13/esm/index.js'
import relativeTime from 'https://unpkg.com/dayjs@1.11.13/esm/plugin/relativeTime/index.js';
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
  const request = await fetch('https://chat-app-remastered.onrender.com/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const response = await request.json();

  socket.emit('register', response._id);

  document.querySelector('.js-user').innerHTML = `
    <div class="flex items-center space-x-3">
      <div class="js-avatar-container js-user-avatar cursor-pointer">
        
      </div>
      <div>
        <p class="font-semibold">${response.name}</p>
      </div>
      <svg class="size-6 ml-10 js-logout-button cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
      </svg>          
    </div>
  `;

  if (response.avatar) {
    // Convert the buffer to a Blob and then read it as base64
    const bufferData = new Uint8Array(response.avatar.data);
    const blob = new Blob([bufferData], { type: 'image/png' });

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      // Set the base64 string as the src of the image
      document.querySelector('.js-avatar-container').innerHTML = `
        <img class="w-10 h-10 rounded-full object-cover" src="${base64String}" alt="">
      `;
    };
    reader.readAsDataURL(blob);
  } else {
    document.querySelector('.js-avatar-container').innerHTML = `
      <div class="w-10 h-10 cursor-pointer bg-gray-600 rounded-full flex items-center justify-center">${response.name[0].toUpperCase()}</div>
    `
  }

  document.querySelector('.js-logout-button').addEventListener('click', async () => {
    const logoutRequest = await fetch('https://chat-app-remastered.onrender.com/users/me/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const message = await logoutRequest.json()

    if (logoutRequest.status === 200) {
      window.location.href = '/login'
    } else {
      console.log(message)
    }
  })

  document.querySelector('.js-user-avatar').addEventListener('click', () => {
    window.location.href = '/profile'
  })

  const usersRequest = await fetch('https://chat-app-remastered.onrender.com/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  let users = await usersRequest.json();

  users = users.filter((user) => {
    return user._id !== response._id
  })
  // Generate user list HTML and insert it into the DOM
  let usersListHTML = '';
  for (const user of users) {
      const chat = await loadChat(response._id, user._id);
      const chatArray = chat.sortedChatReverse || [];
      const chatContent = chatArray.length > 0 && chatArray[0].content ? chatArray[0].content : ' ';
      const createdAt = chatArray.length > 0 && chatArray[0].createdAt ? chatArray[0].createdAt : ' ';
      const chatRecentArray = chatArray.length > 0 && chatArray[0] ? chatArray[0] : [];
      usersListHTML += `
        <div class="flex items-center space-x-3 js-message-user cursor-pointer duration-200 ease-in-out hover:bg-slate-800 p-2 rounded-md" data-user-id="${user._id}">
          <div class="js-user-avatar-container-${user._id}">
            <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                ${user.name[0].toUpperCase()}
            </div>
          </div>
          <div>
            <div class="flex flex-row items-center">
              <p class="font-semibold">${user.name}</p>
              <img class="w-3 h-3 ml-4 js-online-tag-${user._id} hidden" src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Location_dot_green.svg"></img>
            </div>
            <p class="text-sm js-recent-message-${user._id} ${(chatRecentArray.status === 'sent' && chatRecentArray.senderId !== response._id)  || (chatRecentArray.status === 'delivered' && chatRecentArray.senderId !== response._id) ? 'font-bold text-white' : 'font-normal' } text-gray-400">${chatContent.slice(0, 20) } · ${findElapsedTime(createdAt) ? `${findElapsedTime(createdAt)} ago` : ''}</p>
          </div>
        </div>
      `;
  }
  document.querySelector('.js-users-lists').innerHTML = usersListHTML;

  // Set up the socket event listener
  socket.on('onlineUsers', (onlineUsers) => {

    const onlineUsersArray = Array.from(onlineUsers);

    users.forEach((user) => {
        const userElement = document.querySelector(`.js-online-tag-${user._id}`);

        if (userElement) {
            if (onlineUsersArray.includes(user._id)) {
                userElement.classList.remove('hidden');
            } else {
                userElement.classList.add('hidden');
            }
        } else {
            console.warn(`Element for user ID ${user._id} not found.`);
        }
    });
  });




  users.forEach((user) => {
    if (user.avatar) {
      const bufferData = new Uint8Array(user.avatar.data);
      const blob = new Blob([bufferData], { type: 'image/png' });
  
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        // Set the base64 string as the src of the image
        document.querySelector(`.js-user-avatar-container-${user._id}`).innerHTML = `
            <img class="w-10 h-10 rounded-full object-cover" src="${base64String}" alt="">
          `;
      };
      reader.readAsDataURL(blob);
    } else {
      console.log('no avatar')
    }
  })

  document.querySelectorAll('.js-message-user').forEach((selectUserButton) => {
    selectUserButton.addEventListener('click', async () => {



      if (window.innerWidth < 760) {
        document.querySelector('.js-users-container').classList.add('hidden')
        document.querySelector('.js-chat-content').classList.remove('hidden')
      }

      document.querySelector('.js-back-button').addEventListener('click', () => {
        document.querySelector('.js-users-container').classList.remove('hidden')
        document.querySelector('.js-chat-content').classList.add('hidden')
      })

      const receiverId = selectUserButton.dataset.userId;

      document.querySelector(`.js-recent-message-${receiverId}`).classList.remove('font-bold', 'text-white')

      socket.emit('userOpenedChat', {userId: response._id, receiverId})
      localStorage.setItem('receiverId', receiverId)
      console.log(receiverId)
      const user = await findUser(receiverId);
      

      if (user.avatar) {
        const bufferData = new Uint8Array(user.avatar.data);
        const blob = new Blob([bufferData], { type: 'image/png' });
    
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          // Set the base64 string as the src of the image
          document.querySelector('.js-receiver-avatar-container').innerHTML = `
              <img class="w-10 ml-4 h-10 rounded-full object-cover" src="${base64String}" alt="">
            `;
        };
        reader.readAsDataURL(blob);
      } else {
        document.querySelector('.js-receiver-avatar-container').innerHTML = `
          <div class="w-10 h-10 ml-4 bg-blue-500 rounded-full flex items-center js-receiver-avatar justify-center">${user.name[0].toUpperCase()}</div>
        `
      }

      document.querySelector('.js-receiver-name').innerHTML = user.name;
      socket.emit('fetchLastSeen', { userId: user._id })

      const sortedChatObj = await loadChat(response._id, receiverId)
      const sortedChat = sortedChatObj.sortedChat.reverse();

      let chatContainer = document.querySelector('.js-chat-container');
      chatContainer.innerHTML = ''; // Clear previous messages

      sortedChat.forEach((chat) => {
        if (chat.senderId === response._id) {
          chatContainer.innerHTML += `
            <div class="flex justify-end">
              <div class="bg-chat-background rounded-lg p-2 max-w-xs flex flex-col items-end">
                <p>${chat.content}</p>
                <div class="flex flex-row items-center">
                  <p class="text-xsm text-gray-300">${findMessageTime(chat.createdAt)}</p>
                  <img src="images/${chat.status === 'sent' ? 'single-tick.svg' : chat.status === 'delivered' ? 'white-double-tick.svg' : chat.status === 'read' ? 'blue-double-tick.svg' : ''}" class="size-4 ml-1" />
                </div>
              </div>
            </div>
          `;
        } else if (chat.senderId === receiverId) {
          chatContainer.innerHTML += `
            <div class="flex justify-start">
              <div class="bg-gray-700 rounded-lg p-2 max-w-xs flex flex-col items-start">
                <p>${chat.content}</p>
                <p class="text-xsm text-gray-300">${findMessageTime(chat.createdAt)}</p>
              </div>
            </div>
          `;
        }
      });

      document.querySelector('.js-send-message').addEventListener('click', () => {
        const timeSended = new Date().toString().replace('GMT+0530 (India Standard Time)', '')
        const message = document.querySelector('.js-message-input').value;
        if (message === '') {
          return document.querySelector('.js-send-message').setAttribute('disabled', 'disabled')
        }

        const receiverId1 = localStorage.getItem('receiverId')

        socket.emit('message', {
          senderId: response._id,
          receiverId: receiverId1,
          content: message
        });
        // Optionally add the message to the chat container immediately
        // chatContainer.innerHTML += `
        //   <div class="flex justify-end">
        //     <div class="bg-chat-background rounded-lg p-2 max-w-xs flex flex-col items-start">
        //         <p>${message}</p>
        //         <div class="flex flex-row items-center">
        //           <p class="text-xsm text-gray-300">${timeSended}</p>
        //           <img src="images/single-tick.svg" class="size-4 ml-1" />
        //         </div>
        //       </div>
        //   </div>
        // `;

        // Clear input after sending
        document.querySelector('.js-message-input').value = '';
        setTimeout(() => {
          document.querySelector('.js-send-message').removeAttribute('disabled')
        }, 2000);
      });

      document.querySelector('.js-message-input').addEventListener('keydown', (event) => {
        const timeSended = new Date().toString().replace('GMT+0530 (India Standard Time)', '')
        const message = document.querySelector('.js-message-input').value;
        if (message === '') {
          return document.querySelector('.js-send-message').setAttribute('disabled', 'disabled')
        }
        if (event.key === 'Enter') {
          
          document.querySelector('.js-send-message').setAttribute('disabled', 'disabled')
          const receiverId2 = localStorage.getItem('receiverId')
          socket.emit('message', {
            senderId: response._id,
            receiverId: receiverId2,
            content: message
          });
          // Optionally add the message to the chat container immediately
          // chatContainer.innerHTML += `
          //   <div class="flex justify-end">
          //     <div class="bg-chat-background rounded-lg p-2 max-w-xs flex flex-col items-start">
          //       <p>${message}</p>
          //       <div class="flex flex-row items-center">
          //         <p class="text-xsm text-gray-300">${timeSended}</p>
          //         <img src="images/single-tick.svg" class="size-4 ml-1" />
          //       </div>
          //     </div>
          //   </div>
          // `;

          // Clear input after sending
          document.querySelector('.js-message-input').value = '';
          setTimeout(() => {
            document.querySelector('.js-send-message').removeAttribute('disabled')
          }, 2000);
        }
      })

      // Listen for incoming messages
      socket.on('displayMessage', (message) => {
        if (message.senderId === receiverId || message.receiverId === receiverId) {
          chatContainer.innerHTML += `
            <div class="flex ${message.senderId === response._id ? 'justify-end' : 'justify-start'}">
              <div class="${message.senderId === response._id ? 'bg-chat-background' : 'bg-gray-700'} rounded-lg p-2 max-w-xs flex flex-col items-start">
                <p>${message.content}</p>
                <div class="flex flex-row items-center">
                  <p class="text-xsm text-gray-300">${findMessageTime(message.createdAt)}</p>
                  <img src="images/${message.status === 'sent' ? 'single-tick.svg' : message.status === 'delivered' ? 'white-double-tick.svg' : message.status === 'read' ? 'blue-double-tick.svg' : ''}" class=" ${message.senderId === response._id ? 'flex' : 'hidden'}  size-4 ml-1" />
                </div>
              </div>
            </div>
          `;
        }

        document.querySelector('.js-chat-container').scrollTop = document.querySelector('.js-chat-container').scrollHeight
      });
    });
  });

  socket.on('lastSeen', ({lastSeen}) => {
    document.querySelector('.js-last-seen').innerHTML = `${ lastSeen === 'Online' ? 'Online' : `Last seen ${findMessageTime(lastSeen)}` }`;
  })
});

async function findUser(userId) {
  const usersRequest = await fetch(`https://chat-app-remastered.onrender.com/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const user = await usersRequest.json();

  return user;
}

async function loadChat(senderId, receiverId) {
  const senderschatRequest = await fetch(`https://chat-app-remastered.onrender.com/messages/${senderId}/${receiverId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const receiverschatRequest = await fetch(`https://chat-app-remastered.onrender.com/messages/${receiverId}/${senderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const sendersChat = await senderschatRequest.json();
  const receiversChat = await receiverschatRequest.json();

  const chat = sendersChat.concat(receiversChat);
  const sortedChat = chat.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).reverse();
  const sortedChatReverse = chat.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return {
    sortedChat,
    sortedChatReverse
  }
}

function findElapsedTime(timestamp) {
  const date = new Date(timestamp);

  // Check if the date is valid
  if (!dayjs(date).isValid()) {
    return ''; // Return an empty string if the date is invalid
  }

  // Extend dayjs with the relativeTime plugin
  dayjs.extend(relativeTime);

  return dayjs(date).fromNow(true); // Example output: '22 years'
}

function findMessageTime(timestamp) {
  const date = new Date(timestamp)

  return date.toString().replace('GMT+0530 (India Standard Time)', '')
}

