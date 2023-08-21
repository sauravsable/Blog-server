const express=require('express');
const mongoose=require('mongoose');
const bodyparser=require('body-parser')
const cors=require('cors');
const bcrypt=require("bcryptjs");
const session=require('express-session');
require('dotenv').config()

const app=express();
mongoose.connect('mongodb://127.0.0.1:27017/Blog').then(()=> console.log("Database connected"))
.catch(err => console.log(err));
const usermodel=require('./db/user');
const blogmodel=require('./db/blog');

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors({origin:'http://localhost:3000',credentials:true}));

app.use(session({
secret:"Blog",
resave:false,
saveUninitialized:false,
cookie:{
    maxAge:3600000,
    httpOnly:true
}
}));

app.post("/register",async(req,res)=>{

    try{
        const check=await usermodel.findOne({email:req.body.email});

        if(check){
            res.json("exist");
        }
        else{
            req.body.password=await bcrypt.hash(req.body.password,10);
    
            let user=new usermodel(req.body);
            let data=await user.save();
            
            req.session.email=req.body.email;
            console.log(req.session.email);

            res.send(data);
        }
    }
    catch(e){
        res.json("not exist")
    }

})

app.post("/login",async(req,res)=>{

        const result=await usermodel.findOne({email:req.body.email});
        if(result){
            const ismatch=await bcrypt.compare(req.body.password,result.password);

            if(ismatch){
                req.session.email=req.body.email;
                console.log(req.session.email);
                
                res.send(result);
            }
            else{
                res.json('Notmatch');
            }
        }
        else{
            res.json("Notfound");
        }
    
})

app.get("/blogs",async(req,res)=>{
   const blog=await blogmodel.find();

   if(blog.length >0){
    res.send(blog);
   }
   else{
    res.send({result:"No Blog Found"});
   }
})

app.get("/myblogs",async(req,res)=>{
    console.log(req.session.email);
    const blogs=await blogmodel.find({email:req.session.email});

    if(blogs[0]){
     res.send(blogs);
    }
    else{
     res.send({result:"No Blogs Found"});
    }
 })

app.post("/addblog",async(req,res)=>{
    console.log(req.body);
    let obj={title:req.body.title,name:req.body.name,email:req.session.email,blog:req.body.blogdata};
    const blog= new blogmodel(obj);
    const result=await blog.save();
    res.send(result);
})

app.delete("/deleteblog/:id",async(req,res)=>{
    const result=await blogmodel.deleteOne({_id:req.params.id});
    res.send(result);
})

app.get("/getblog/:id",async(req,res)=>{
    const result= await blogmodel.findOne({_id:req.params.id});

    if(result){
        res.send(result);
    }
    else{
        res.send({result:"Not Found"});
    }

})

app.put("/updateblog/:id",async(req,res)=>{
    const result= await blogmodel.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }
    )
    res.send(result);
})

app.get("/search/:key",async(req,res)=>{
    const result= await blogmodel.find({
        "$or":[
            {name:{$regex:req.params.key}},
        ]
    })
    res.send(result);
})

app.listen("5000",()=>{
    console.log("server started");
});