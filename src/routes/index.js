const express = require('express');
const User = require('../controllers/user.controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config()

const routes = express.Router();

let tokenRefresh = []

// VARIÁVEL DE TESTE DO SERVIDOR
routes.get('/', verifyUser, (req, res) => {
  res.send("It working !")
});

// USERS
// GET /users - Responde com um JSON contendo todos os Usuários do sistema
routes.get('/users', async (req, res) => {
  const user = await User.showUser()
  res.status(201).json(user);
});

// POST /users
routes.post('/user', async (req, res) => {
  try{
    const hashPass = await bcrypt.hash(req.body.password, 10);
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: hashPass
    }
    User.addUser(user);
    res.status(201).send("User create");
  }
  catch(err){
    res.status(500).send(err.message);
    console.log(err);
  }
  
})

// POST /users/login
routes.post('/user/login', async (req, res) => {
  const user = await User.findUser(req.body.email)
  if(user == null){
    return res.status(400).json({"message": "User not found"});
  }
  try{
    if(await bcrypt.compare(req.body.password, user.password)){
      const accessToken = generateToken(user) 
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
      tokenRefresh.push(refreshToken);
      res.status(200).json({
        "message":"Password is correct", 
        "accessToken": accessToken,
        "refreshToken": refreshToken
      });
    } else {
      res.status(403).send("Password is incorrect");
    }
  }
  catch(err){
    res.status(500).send(err.message);
  }
  
})

// DELETE /users/logout
routes.delete('/users/logout', (req, res) =>{
  tokenRefresh = tokenRefresh.filter(token => token != req.body.token);
  res.sendStatus(203)
});

// TOKEN
routes.post('/auth/token',(req, res) => {
  const refreshToken = req.body.token
  if(refreshToken == null) return res.sendStatus(401)
  if(!tokenRefresh.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    const accessToken = generateToken({name: user.name});
    res.json({"access_token": accessToken})
  })
});

// MIDDLEWARE
function verifyUser(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if(token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

function generateToken(user){
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});
}

module.exports = routes;