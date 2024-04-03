const mongoose = require('mongoose');



const addentry = new mongoose.Schema({ 
    uuid1:{type:String ,required:true},
    date:{type:Date, required:true},
  description:{type:String,required:true}
});

console.log("MongoDB connected");

const entry = mongoose.model("hello", addentry);


module.exports=entry