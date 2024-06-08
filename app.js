const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv= require('dotenv')
dotenv.config()


app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/jobs'));
app.use('/api/users', require('./routes/users'));

const url= process.env.MONGO_URI
mongoose.connect(url)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
