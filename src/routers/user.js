const express = require('express')
require('../db/mongoose.js')
const User = require('../models/user.js')
const auth = require('../middleware/auth.js')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const sharp = require('sharp')
const Chat = require('../models/chat.js')

const router = express.Router()

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body)
    const token = await user.generateAuthToken()
  
    res.status(201).send({ user, token }) 
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

const upload = multer({
  limits: {
    fileSize: 2000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('File type must be jpg, jpeg, png'))
    }

    cb(undefined, true)
  }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.set('Content-Type', 'image/png');
  res.send(req.user.avatar);
}, (error, req, res, next) => { //Error handling
  res.status(400).send({error: error.message})
})

router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).send({error: 'User not found'})
    }
    res.send(user)
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

router.get('/users', auth, async (req, res) => {
  const users = await User.find({  })
  try {
    res.send(users)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/users/me', auth, (req, res) => {
  try {
    res.send(req.user) 
  } catch (error) {
    res.status(400).send({error: error.message})
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findOne({email: req.body.email})

    if (!user) {
      throw new Error("User not found");
    }
  
    const pass = await bcrypt.compare(req.body.password, user.password)
  
    if (pass) {
      const token = await user.generateAuthToken()
      res.send({user, token})
    } else {
      throw new Error("gmail or password is incorrect");
    } 
  } catch (error) {
    res.status(400).send({error: error.message})
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    await Chat.deleteMany({
      $or: [
        {senderId: req.user._id},
        {receiverId: req.user._id}
      ]
    })

    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post('/users/me/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.tokens = user.tokens.filter((token) => {
      return token.token !== req.token
    })
  
    await user.save()
  
    res.send({message: 'User logged out successfully'})
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

router.patch('/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const allowedUpdates = ['name', 'email', 'password']
    const updates = Object.keys(req.body)
  
    updates.forEach((update) => {
      if (allowedUpdates.includes(update)) {
        user[update] = req.body[update]
      } else {
        throw new Error("Update not allowed");
      }
    })
  
    const updatedUser = await user.save()
    res.send(updatedUser) 
  } catch (error) {
    res.status(400).send({error: error.message})
  }
})


module.exports = router