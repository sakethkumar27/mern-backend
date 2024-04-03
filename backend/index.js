const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const register=require('./schema.js')
const entry=require('./entry.js')
const middleware=require('./jwt.js')
const uuid=require('uuid')
require('dotenv').config();

app.use(cors())
app.use(bodyParser.json())
const SECRET_KEY="secretkey"
const MONGODB_URI = process.env.MONGODB_URI;
// Connect to MongoDB server
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB Atlas");

        // You can optionally log the database name if needed
        console.log("Database name:", mongoose.connection.db.databaseName);
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB Atlas:", err);
    });

app.post('/register',async(req,res)=>{
    try{
        const {username,password}=req.body       
        const hashpassword=await bcrypt.hash(password,10)
        const uuid1=uuid.v4()
       
        await register.create({uuid1:uuid1,username:username,password:hashpassword})
        res.status(200).json({message:"user created successfully"})
    }
    catch(err){
        res.status(500).json({err:"error in registering"})
    }
})

app.get("/register",async(req,res)=>{
    try{
        const use=await register.find()
        res.status(201).json(use)
    }
    catch(err){
        res.status(500).json({err:"unable to get users"})
    }
})
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await register.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        let payload = { userid: user._id, uuid1: user.uuid1 };
        
        jwt.sign(payload, SECRET_KEY, (err, token) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ err: "Error signing token" });
            }
            return res.json({ token });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ err: "Error in login" });
    }
});


 


// Use middleware for routes that require authentication
app.get('/home', middleware, async (req, res) => {
    try {
        const user = await register.findById(req.user);
       

        if (!user) {
            return res.status(401).json("User not found");
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});
app.post('/addentry', middleware, async (req, res) => {
    const { uuid1,date, description } = req.body; // Change 'uuid' to 'uuid1'
    try {
        const uuid1 = req.uuid1; // Use 'uuid' to store req.uuid1
        await entry.create({ uuid1, date, description });
        res.json({ uuid1, date, description });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post("/api/getuser", middleware, async (req, res) => {
    try {
        const uuid1=req.uuid1 // Assuming the middleware has added the UUID to req
        const userEntries = await entry.find({uuid1}); // Find entries by user's UUID and select only date and description fields
        res.json(userEntries);
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a route to handle entry deletion
 // Import the Entry model

app.delete('/deleteentry/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        // Find the entry by ID and delete it
        const deletedEntry = await entry.findByIdAndDelete(id);
        if (!deletedEntry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }
        res.json({ success: true, message: 'Entry deleted successfully', data: deletedEntry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Assuming you have implemented middleware for token validation and UUID extraction

// Update route to update an entry by ID
app.put('/update/:id', middleware, async (req, res) => {
    const { date, description } = req.body;
    const entryId = req.params.id;
    const uuid1 = req.uuid1;
  
    try {
      // Assuming you have defined your Entry schema and imported it as 'entry'
      const updatedEntry = await entry.findByIdAndUpdate(entryId, { date, description }, { new: true });
      
      // Check if the entry exists and belongs to the authenticated user
      if (!updatedEntry || updatedEntry.uuid1 !== uuid1) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      res.json({ message: 'Entry updated successfully' });
    } catch (error) {
      console.error('Error updating entry:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/viewentry/:id', async (req, res) => {
    try {
      const view = await entry.findById(req.params.id);
      if (!view) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(view);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  



    
//routes
//middlewares
//schema
app.listen(8000,()=>{
    console.log("server is listening to port 4000")
})