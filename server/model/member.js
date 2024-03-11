const mongoose=require("mongoose");
const {Schema} =mongoose;
const bcrypt=require("bcrypt");

const memberScheme=new Schema({
    username:{
        type:String,
        required:true,
        maxlength:30,
        minlength:3
    },
    email:{
        type:String,
        required:true,

    },
    password:{
        type:String,
        required:true,
        maxlength:15,
        minlength:5
    },
    role:{
        type:String,
        enum:['member','boss'], //The enum validator is an array that will check if the value given is an item in the array.
        required:true,

    },
    date:{
        type:Date,
        default:Date.now
    },
})

memberScheme.methods.isMember=function(){
    return this.role=="member";
}

memberScheme.methods.isBoss=function(){
    return this.role=="boss";
}

memberScheme.methods.comparePassword=async function(password,cb){
    let result;
    console.log("password: "+password);
    console.log("this.password: "+this.password);
    try{
        result=await bcrypt.compare(password,this.password);
    return cb(null,result);
    }catch(e){
        return cb(e,result);
    }
    
}
memberScheme.pre("save",async function (next){
    if(this.isNew || this.isModified("password")){
        const hashValue=await bcrypt.hash(this.password,10);
        this.password=hashValue;
}
    next();

});

module.exports=mongoose.model("judgeMember",memberScheme);
