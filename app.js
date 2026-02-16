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
//--------------------------phase2----------------------------//

 // require models
const Product = require("./models/Products");

//route add product
app.post("/add_product", async (req, res) => {  
    try {
        
        const { name, price, stock ,email  } = req.body;
        
        // validate data
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "user not found" });
        }
            if(user.role!=="admin"){
               return res.status(403) .json({ msg: "Access denied: Admin only" });

            }
        
        if (!name || !price || !stock) {
            return res.status(400).json({ msg: "Data is incomplete " }); 
        }
       
         const existingProduct = await Product.findOne({ name });
        
          
            if (existingProduct) {
              existingProduct.stock += stock;
              await existingProduct.save();
        
              return res.status(200).json({
                msg: "Stock updated successfully",
                product: existingProduct,
              });
            }
        
        // create new product
            const product = await Product.create({
              name,
              price,
              stock,
            });
        
        //res
        res.status(201).json({ msg: "Product added successfully", 
            data: user 
        });
        
        
     } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Server error"
        });
    }
});
app.get("/all_products", async (req, res) => {
  try {
   
    const all_products = await Product.find({}, "name price stock");

    res.status(200).json({
      msg: "Products fetched successfully",
      products: all_products, 
    });
  } catch (error) {
    res.status(500).json({
      msg: "Server error",
      error: error.message,
      
    });

  }
});
//SEARCH
app.get("/search", async (req, res) => {
  try {

    const { search } = req.query;

  
    let query = {};
    if (search) {
   
      query.name = { $regex: search, $options: "i" };
    }

    const all_products = await Product.find(query, "name price stock");

    res.status(200).json({
      msg: "Products fetched successfully",
      products: all_products,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});


// Run Server
app.listen(Port, () => {
  console.log(`server Running At Port ${Port}`);
});



