require("dotenv").config();

const express =require("express");


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
 

 
// Run Server
app.listen(Port, () => {
  console.log(`server Running At Port ${Port}`);
});