
# CHAT APP

A real-time chat application that allows users to communicate with each other, featuring login, CRUD operations, and integration with Socket.io for instant messaging.


## Features
- **Real-time Messaging:** Built with Socket.io to enable instant communication between users.
- **User Authentication:** Users can sign up, log in, and start chatting with others.
- **CRUD Operations:** Users can perform Create, Read, Update, and Delete actions.
- **MongoDB Integration:** Data such as users and chat rooms are stored in MongoDB.
## Technologies Used
- **Node.js**
- **Express.js**
- **Socket.io**
- **MongoDB** with **Mongoose**
- **HTML, CSS, JavaScript**
- **bcrypt** for password hashing
- **jsonwebtoken** for authentication

## Setup Instructions
1. **Clone the repository:**

   ```bash
   git clone https://github.com/Pratiyankkumar/Chat-App-Remastered.git
   cd Chat-App-Remastered
2. **Install The dependencies**
    ```bash
    npm install
3. **Set up environment variables:**
    Create a *.env* file in the root directory and add the following:

    ```bash
    PORT=your_port
    MONGODB_URL=your_mongodb_url
    JWT_SECRET=your_jwt_secret
4. **Start The application:**
    ```bash
    npm start
5. **Access the application**
    Open your browser and navigate to *http://localhost:your_port*

## Usage
- **Signup/Login:** Users can sign up with a new account or log in with an existing one.
- **Select user to chat with**
- **Message the user in real time**
## Future Improvements

1. **Room Creation:** Users can create room to chat with more than one user
2. **File sharing in chat:** Users can share file in real time
3. **Typing indicator and read receipts:** Users can see which user is typing and last seen of user
## Contribute
Feel free to contribute to the project by submitting issues or pull requests.
