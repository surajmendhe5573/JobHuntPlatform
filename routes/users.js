const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  updates.forEach(update => req.user[update] = req.body[update]);
  if (req.body.password) {
    req.user.password = await bcrypt.hash(req.body.password, 8);
  }
  await req.user.save();
  res.send(req.user);
});

module.exports = router;
