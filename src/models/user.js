const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
require('dotenv').config({path: './config/dev.env'})
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (email) => {
        return validator.isEmail(email)
      },
      message: 'This is not a valid Email'
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  },
  lastSeen: {
    type: Date,
    default: Date.now()
  }
})

userSchema.pre('save', async function () {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
})

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
  
  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

const User = mongoose.model('User', userSchema)

module.exports = User