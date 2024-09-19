const mongoose = require('mongoose')
const { trim } = require('validator')

const chatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    default: '',
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, {
  timestamps: true
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat