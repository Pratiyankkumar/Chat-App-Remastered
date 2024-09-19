const express = require('express')
require('../db/mongoose.js')
const Chat = require('../models/chat.js')
const auth = require('../middleware/auth.js')

const router = express.Router()

router.post('/messages', auth, async (req, res) => {
  try {
    const message = new Chat(req.body)
    await message.save()
    res.send(message) 
  } catch (error) {
    res.status(400).send({error: error.message}) 
  }
})

// router.get('/messages/:receiverId', auth, async (req, res) => {
//   try {
//     const message = await Chat.find({senderId: req.user._id, receiverId: req.params.receiverId})

//     if (message.length === 0) {
//       return res.status(404).send({ error: "No messages found" });
//     }
  
//     res.send(message) 
//   } catch (error) {
//     res.status(500).send({error: error.message})
//   }
// })

router.get('/messages/:receiverId/:senderId', async (req, res) => {
  try {
    const message = await Chat.find({senderId: req.params.senderId, receiverId: req.params.receiverId})

    if (message.length === 0) {
      return res.send([])
    }
  
    res.send(message) 
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

router.get('/message/:id', async (req, res) => {
  try {
    const message = await Chat.findOne({_id: req.params.id})
    if (message.length === 0) {
      return res.status(404).send({ error: "No messages found" });
    }
  
    res.send(message) 
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

router.patch('/messages/:id/status', auth, async (req, res) => {
  try {
    const message = await Chat.findById(req.params.id)

    if (message.length === 0) {
      return res.status(404).send({ error: "No messages found" });
    }
    message.status = req.body.status

    await message.save()
    res.send(message) 
  } catch (error) {
    res.status(500).send({error: error.message}) 
  }
})

router.delete('/messages/:id', auth, async (req, res) => {
  try {
    const message = await Chat.findOneAndDelete({senderId: req.user._id, _id: req.params.id})

    if (message.length === 0) {
      return res.status(404).send({error: "No message found"})
    }

    res.send(message)
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})


module.exports = router