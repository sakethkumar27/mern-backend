const mongoose = require('mongoose');



const signin = new mongoose.Schema({
 uuid1:{type:String},
  username: { type: String},
  password: { type: String},
});

console.log("MongoDB connected");

const register = mongoose.model("register", signin);


module.exports=register
