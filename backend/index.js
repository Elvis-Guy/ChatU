const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');


dotenv.config();
// console.log(process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL);

const jwtSecret = process.env.JWT_SECRET;

const app = express();

app.use(express.json());

app.use(cookieParser()); 

console.log(process.env.FRONTEND_URL);

app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL,
}));

app.get('/test', (request,response) => {
  response.json('test ok');
});

app.get('/profile', (request,response) => {
  const token = request.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      response.json(userData);
    });
  } else {
    response.status(401).json('no token');
  }
});

app.post('/register', async (request,response) => {
  const {username,password} = request.body;
  const createdUser = await User.create({username,password});
  jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
    if (err) throw err;
    response.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
      id: createdUser._id,
    });
  });
  
  
});

app.listen(4000);

