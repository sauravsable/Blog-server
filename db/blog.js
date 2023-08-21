const mongoose=require('mongoose');

const blogschema=new mongoose.Schema({
    title:{
     type:String,
     required:true
    },
    name:{
        type:String,
        require:true
    },
    email:
    {
        type:String,
        required:true,
        unique:true,
    },
    blog:{
        type:String,
        require:true
    }

});

module.exports=new mongoose.model("blogdatas",blogschema);