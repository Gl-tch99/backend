var express = require('express');
var router = express.Router();
const Project=require('../models/project');
const UUID = require('uuid');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/submit',(req,res)=>{
  console.log(req.body)
  // let obj={name:'shweta',surname:'kamble',salary:123344}
   /*let obj=({name:req.body.Project.name,
    creatorid:req.body.Project.creatorid,
    description:req.body.Project.description,
    requirements:req.body.Project.requirements,
    payment:req.body.Project.payment,
    status:req.body.Project.status,
    leaderid:req.body.Project.leaderid,
    teamusers:req.body.Project.teamusers})*/


    var project = {
        ...req.body.Project,
        projectid:generateUUID().toString(),
    }
 const p1 =new Project(project)
 console.log(p1)
 p1.save((err, doc) => {
  if (!err)
      console.log('success'+ 'Project added successfully!');
  else
      console.log('Error during record insertion : ' + err);
});
 /*p1.save((err)=>{
    if(err) res.sendStatus(400)
    else
 p1.save()
    res.send("data inserted successfully")
 })*/
 
})

const generateUUID =()=>{
    const uuid = UUID.v4()
    
       return(
        uuid.toString()
       );
  }

router.get('/fetchdata',(req,res)=>{
  Project.find((err,data)=>{
   if(err) throw err
   res.send(data)
  })
 })

 router.put('/update/:id',(req,res)=>{
        Project.findById(req.params.id,(err,data)=>{
            if(err) throw err
            data.name=req.body.name,
            data.surname=req.body.surname,
            data.salary=req.body.salary
            data.save((err)=>{
                if(err) res.send('not updated')
                else
                res.send("data updated")
            })
    
        })
    })

    router.delete('/:id',(req,res)=>{
    Project.findByIdAndDelete(req.params.id,(err)=>{
        if(err) res.send('not deleted')
        else
        res.send("deleted")
    })
})
module.exports = router;
