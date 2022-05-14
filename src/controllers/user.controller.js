const Models = require('../../models');
const users = Models.User

async function addUser(User){
  try {
    const created_user = await users.create(User);
    return created_user
  }catch (err) {
    return Promise.reject(err);
  }
}

async function showUser(){
  try{
    return users.findAll()
  }catch (err) {
    return Promise.reject(err);
  }
}

function removeUser(User){
  users.pop(User)
}

async function findUser(Email){
  try {
    const user = await users.findOne({ where : {email : Email }});
    return user.toJSON();
  }catch (err){
    return null;
  }
}


module.exports = {
  addUser,
  showUser,
  findUser,
  removeUser
};