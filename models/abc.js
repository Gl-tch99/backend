const mongoose=require('mongoose')
const Abc=new mongoose.Schema({
 
    userId:
    {
        type:String,
    },

        name:
        {
        type:String,
    },
        
        
        surname:
        {
            type:String,
        },

        email:
        {
            type:String,

        },

        password:
        {
        type:String,
    },

        mobile:
        {
            type:String,
        },

        projects:
        {
            type:String,
        },

        friends:
        {
            type:String,
        },

        skillsets:
        {
            type:String,
        },

        experience:
        {
            type:String,
        },

        description:
        {
            type:String,
        },

   
})
module.exports=mongoose.model('Abc',Abc)