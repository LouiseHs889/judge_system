const { route } = require("./auth");

const router = require("express").Router();
const Course = require("../model").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("course route正在接受一個request...");
  next();
});

// 獲得系統中的所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(5000).send(e);
  }
});

// 用老闆id來尋找課程
router.get('/boss/:_boss_id', async (req,res)=>{
   let {_boss_id}=req.params;
   let foundItem=await Course.find({boss:_boss_id})
   .populate("boss",["username","email"])
   .exec();
   return res.send(foundItem);
})

//用成員id 來尋找註冊過的課程
router.get('/member/:_member_id', async(req,res)=>{
  let {_member_id}=req.params;
  let foundItem=await Course.find({member:_member_id})
  .pupulate("boss",["username","email"])
  .exec();
  return res.send(foundItem);
})

//用八卦名稱搜尋課程
router.get('/findByName/:name',async(req,res)=>{
  let {name}=req.params;
  let foundItem=await Course.find({title:name})
  .populate(boss,[username,email])
  .exec();
  return res.send(foundItem);
})

//用課程id搜尋課程
router.get(':_id',async (req,res)=>{
  let {_id} =req.params;
  let foundItem = await Course.find({_id})
  .populate(boss,[username,email])
  .exec();
  return res.send(foundItem);
})

//新增課程
router.post('/',async (req,res)=>{
  // let {error} =courseValidation(req.body);
  // if(error) return res.status(400).send(error.details[0].message);

  if(req.user.isMember()){
    return res.status(400).send("only teacher can post the course");
  }
  // let{title,description,price}=req.body;
  try{
    let newCourse=new Course({
      title:req.body.title,
      description:req.body.description,
      price:req.body.price,
      boss:req.user._id,
    });
    console.log(newCourse);
    let savedCourse=await newCourse.save();
    return res.send("the course has been saved");
  }catch(e){
    return res.send(e);
  }
});

//透過course id新增課程
router.post('/enroll/:_id',async(req,res)=>{
  let {_id}=req.params;
  try{
    let findItem=await Course.findOne({_id}).exec();
    findItem.students.push(req.member._id);
    await findItem.save();
    return res.send("註冊成功");
  }catch(e){
    return res.send(e);
  }
  

})

//更新課程
router.patch('/:_id',async(req,res)=>{
  let{error} =courseValidation(req.body);
  if(error) return res.status(500).send("validate fail");
  let {_id}=req.params;
  try{
      let courseFound=await Course.findOne({_id}).exec();
      if(!courseFound) return res.status(500).send("can't find the course");

      if(courseFound.boss.equals(req.member._id)){
        let findItem=await Course.findOneAndUpdate({_id},req.body,{
        new:true,
        runValidators:true,
  })  
        return res.send({
          message:"update success",
          findItem
        });

      }else{
        return res.status(500).send("only boss can update");
      }
  
}catch(e){
  return res.status(500).send(e);
}
})

//刪除課程
router.delete('/:_id',async(req,res)=>{
  let {_id}=req.params;
  try{
    let findItem=await Course.findOne({_id}).exec();
    if(!findItem){
      return res.send("the item is not exist");
    }
    if(findItem.boss.equals(req.member._id)){
      await Course.deleteOne({_id}).exec();
      return res.send("the item has been deleted");
    }
  }catch(e){
    return res.status(500).send("delete failed");
  }
})
module.exports = router;
