var express = require("express");
var router = express.Router();
const Project = require("../models/project");
const UUID = require("uuid");
const User = require("../models/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/submit", (req, res) => {
  console.log(req.body);
  var project = {
    ...req.body.Project,
    projectid: generateUUID().toString(),
  };
  const p1 = new Project(project);
  console.log(p1);
  //   const user = {
  //     ...req.body.User,
  //     projects: [...projects, req.body.Project],
  //   };
  //   const u1 = new User(user);
  //   console.log(user);

  p1.save()
    .then((data) => {
      console.log("success" + " Project added successfully!");
      User.updateOne(
        { userid: req.body.User.userid },
        { $push: { projects: req.body.Project } }
      );

      res.status(200).send("Project Added");
    })
    .catch((err) => {
      console.log("Error during record insertion : " + err);
      res.status(401).send(err);
    });
  //   User.findOne({userid:})
  /*p1.save((err)=>{
    if(err) res.sendStatus(400)
    else
 p1.save()
    res.send("data inserted successfully")
 })*/
});

const generateUUID = () => {
  const uuid = UUID.v4();

  return uuid.toString();
};

router.get("/fetchdata", (req, res) => {
  Project.find((err, data) => {
    if (err) throw err;
    res.send(data);
  });
});

router.put("/update/:id", (req, res) => {
  Project.findById(req.params.id, (err, data) => {
    if (err) throw err;
    (data.name = req.body.name),
      (data.surname = req.body.surname),
      (data.salary = req.body.salary);
    data.save((err) => {
      if (err) res.send("not updated");
      else res.send("data updated");
    });
  });
});

router.delete("/:id", (req, res) => {
  Project.findByIdAndDelete(req.params.id, (err) => {
    if (err) res.send("not deleted");
    else res.send("deleted");
  });
});
module.exports = router;
