const route=require("express").Router();
const registerValidation =require("../validation").registerValidation;
const loginValidation=require("../validation").loginValidation;
const member = require("../model").member;
const jwt=require("jsonwebtoken");

route.use((req,res,next)=>{
    console.log("I'm receiving a request about auth");
    next();
})

route.get('/testAPI',(req,res)=>{
    return res.send("success");
})

route.post('/register',async (req,res)=>{
    let {error} =registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const emailExist=await member.findOne({email:req.body.email});
    if(emailExist) return res.status(400).send("已經註冊過了");

    let{email,username,password,role}=req.body;
    let newMember=new member({email,username,password,role});
    try{
        let savedMember=await newMember.save();
        return res.send({
            mes:"save success",
            savedMember,
        })
    }catch(e){
        return res.send("wrong save the input");
    }
})

route.post('/login',async(req,res)=>{
        let {error}=loginValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        const findMember =await member.findOne({email:req.body.email});
        console.log(findMember);
        if(!findMember) return res.send("we don't have the user");


        findMember.comparePassword(req.body.password,(err,isMatch)=>{
            if(err) return res.status(500).send(err);
           
            if(isMatch){ console.log("come to is match");
                const tokenObject={_id:findMember._id,email:findMember.email};
                console.log("tokenObject: "+tokenObject);
                const token=jwt.sign(tokenObject,"i am proud of myself");
                console.log("token"+token);
                return res.send({
                    message:"login success",
                    token:"JWT "+token,
                    user:findMember,
                });

            }else{
                return res.status(401).send("login wrong");
            }

        })

})
module.exports=route;