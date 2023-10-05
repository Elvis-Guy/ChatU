const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require ('bcryptjs');
const User = require('./models/User');
const ws = require('ws');


dotenv.config();
// console.log(process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL);

const jwtSecret = process.env.JWT_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);

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

app.post('/login', async (request,response) => {
  const {username, password} = request.body;
  const foundUser = await User.findOne({username});
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
        response.cookie('token', token, {sameSite:'none', secure:true}).json({
          id: foundUser._id,
        });
      });
    }
  } 
});

app.post('/register', async (request,response) => {
  const {username,password} = request.body;
  const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
  const createdUser = await User.create({
    username:username,
    password:hashedPassword,
  });
  jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
    if (err) throw err;
    response.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
      id: createdUser._id,
    });
  });
  
  
});

const server = app.listen(4000);

const wss = new ws.WebSocketServer({server});
wss.on('connection', (connection, request) => {

  const cookies = request.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const {userId, username} = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }
  [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
      online: [...wss.clients].map(c => ({userId:c.userId, username:c.username}))

    }));
  });
});