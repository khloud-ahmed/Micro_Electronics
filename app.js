require("dotenv").config();

const express =require("express");
// hashed
const bcrypt =require("bcrypt");

const app = express ();


app.use(express.json());

const mongoose =require("mongoose");


const Port= process.env.Port || 3000;
 //db con 
 async function dbConenction(){
     try{
         await mongoose .connect(process.env.Url);
         console.log("connected");
         
     }
     catch(error){
         console.log(error);
     }
 }
 dbConenction();
 // require models
const User = require("./models/Users");

// POST route register
app.post("/register", async (req, res) => {  
    try {
        // get data from request body
        const { user_name, email, password, role } = req.body;
        
        // validate data
        if (!user_name || !email || !password) {
            return res.status(400).json({ msg: "invalid data" }); 
        }
        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "user already exists" });
        }
        //create new user 
        const hashpassword = await bcrypt.hash(password, 10);
        const user = await User.create ({
            user_name,  
            email,
            password: hashpassword ,
            role,
        });
        //res
        res.status(201).json({ msg: "user registered successfully", 
            data: user 
        });
        
        
     } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Server error"
        });
    }
});
//login
app.post("/login", async (req, res) => {  

try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                msg: "Missing required data"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                msg: "user account not found"
            });
        }
        const matchedPassword = await bcrypt.compare(password, user.password);

        if (!matchedPassword) {
            return res.status(400).json({
                msg: "invalid password"
            });
        }
        res.status(200).json({
            msg:"success login"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Server error"
        });
    }
 });
// Run Server
app.listen(Port, () => {
  console.log(`server Running At Port ${Port}`);
});



